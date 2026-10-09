export declare class UserProfileDto {
    id: string;
    email: string;
    fullname: string;
    createdAt: string;
}
export declare class LoginResponseDto {
    accessToken: string;
    tokenType: 'Bearer';
    expiresIn: number;
    user: UserProfileDto;
}
