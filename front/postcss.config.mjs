// O Tailwind entra no build pelo PostCSS, que o Next.js já roda sobre o CSS importado.
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
