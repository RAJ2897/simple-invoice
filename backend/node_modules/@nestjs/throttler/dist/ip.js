"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_IPV6_SUBNET_PREFIX = void 0;
exports.normalizeIp = normalizeIp;
const net_1 = require("net");
exports.DEFAULT_IPV6_SUBNET_PREFIX = 64;
function toHextets(address) {
    let head = address;
    const lastColon = head.lastIndexOf(':');
    const tail = head.slice(lastColon + 1);
    if (tail.includes('.')) {
        const octets = tail.split('.').map(Number);
        if (octets.length !== 4 || octets.some((o) => !Number.isInteger(o) || o < 0 || o > 255)) {
            return null;
        }
        const high = ((octets[0] << 8) | octets[1]).toString(16);
        const low = ((octets[2] << 8) | octets[3]).toString(16);
        head = `${head.slice(0, lastColon + 1)}${high}:${low}`;
    }
    const sides = head.split('::');
    if (sides.length > 2) {
        return null;
    }
    const left = sides[0] ? sides[0].split(':') : [];
    const right = sides.length === 2 && sides[1] ? sides[1].split(':') : [];
    const fill = sides.length === 2 ? 8 - left.length - right.length : 0;
    if (fill < 0 || left.length + fill + right.length !== 8) {
        return null;
    }
    const groups = [...left, ...new Array(fill).fill('0'), ...right];
    const hextets = groups.map((group) => parseInt(group, 16));
    if (hextets.some((hextet) => !Number.isInteger(hextet) || hextet < 0 || hextet > 0xffff)) {
        return null;
    }
    return hextets;
}
function maskHextets(hextets, prefix) {
    return hextets.map((hextet, index) => {
        const bitsBefore = index * 16;
        if (prefix >= bitsBefore + 16) {
            return hextet;
        }
        if (prefix <= bitsBefore) {
            return 0;
        }
        const keep = prefix - bitsBefore;
        return hextet & ((0xffff << (16 - keep)) & 0xffff);
    });
}
function formatIpv6(hextets) {
    let bestStart = -1;
    let bestLength = 0;
    let runStart = -1;
    let runLength = 0;
    for (let index = 0; index < hextets.length; index++) {
        if (hextets[index] !== 0) {
            runStart = -1;
            runLength = 0;
            continue;
        }
        if (runStart === -1) {
            runStart = index;
        }
        runLength++;
        if (runLength > bestLength) {
            bestStart = runStart;
            bestLength = runLength;
        }
    }
    const groups = hextets.map((hextet) => hextet.toString(16));
    if (bestLength < 2) {
        return groups.join(':');
    }
    return `${groups.slice(0, bestStart).join(':')}::${groups.slice(bestStart + bestLength).join(':')}`;
}
function normalizeIp(ip, ipv6SubnetPrefix = exports.DEFAULT_IPV6_SUBNET_PREFIX) {
    if (typeof ip !== 'string' || ip.length === 0) {
        return ip;
    }
    const zoneIndex = ip.indexOf('%');
    const bare = zoneIndex === -1 ? ip : ip.slice(0, zoneIndex);
    const version = (0, net_1.isIP)(bare);
    if (version === 4) {
        return bare;
    }
    if (version !== 6) {
        return ip;
    }
    const hextets = toHextets(bare.toLowerCase());
    if (!hextets) {
        return ip;
    }
    const isLoopback = hextets[7] === 1 && hextets.slice(0, 7).every((hextet) => hextet === 0);
    if (isLoopback) {
        return '::1';
    }
    const isIpv4Mapped = hextets[0] === 0 &&
        hextets[1] === 0 &&
        hextets[2] === 0 &&
        hextets[3] === 0 &&
        hextets[4] === 0 &&
        hextets[5] === 0xffff;
    if (isIpv4Mapped) {
        return [hextets[6] >> 8, hextets[6] & 0xff, hextets[7] >> 8, hextets[7] & 0xff].join('.');
    }
    const prefix = Number.isFinite(ipv6SubnetPrefix)
        ? Math.min(Math.max(Math.trunc(ipv6SubnetPrefix), 0), 128)
        : exports.DEFAULT_IPV6_SUBNET_PREFIX;
    return `${formatIpv6(maskHextets(hextets, prefix))}/${prefix}`;
}
//# sourceMappingURL=ip.js.map