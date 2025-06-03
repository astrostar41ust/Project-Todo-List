# Webpack Template

A modern and flexible webpack template for quickly bootstrapping new web projects.

## Features

- 📦 Webpack 5 configuration
- 🔥 Hot Module Replacement (HMR)
- 🎨 SASS/SCSS support
- 🌟 ES6+ support via Babel
- 🔍 Source maps
- 🧪 Testing setup
- 📱 Production optimization
- 🎯 Asset management

## Prerequisites

- Node.js (version 14.x or higher)
- npm or yarn

## Getting Started

1. Clone this template:
```bash
git clone https://github.com/yourusername/webpack-template.git
cd webpack-template
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start development server:
```bash
npm run dev
# or
yarn dev
```

4. Build for production:
```bash
npm run build
# or
yarn build
```

## Project Structure

```
webpack-template/
├── src/               # Source files
├── dist/              # Production build
├── webpack/           # Webpack configuration files
├── .babelrc          # Babel configuration
├── .gitignore        # Git ignore rules
└── package.json      # Project dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run linter

## Customization

You can customize the webpack configuration by modifying the files in the `webpack` directory:

- `webpack.common.js` - Common configuration
- `webpack.dev.js` - Development configuration
- `webpack.prod.js` - Production configuration

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
