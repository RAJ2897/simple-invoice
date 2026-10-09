import { createTheme, type MantineColorsTuple } from '@mantine/core'

const brand: MantineColorsTuple = [
  '#eef0ff',
  '#dbdefa',
  '#b4baf0',
  '#8b94e7',
  '#6873df',
  '#525edb',
  '#4c5fd5',
  '#3a46c0',
  '#323eac',
  '#273598',
]

export const theme = createTheme({
  primaryColor: 'brand',
  colors: { brand },
  fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  headings: { fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif', fontWeight: '650' },
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    Button: { defaultProps: { radius: 'md' } },
    Paper: { defaultProps: { radius: 'lg' } },
    Card: { defaultProps: { radius: 'lg' } },
  },
})
