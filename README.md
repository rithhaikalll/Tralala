# 👥 Contributors

| Name | Contributions |
|------|---------------|
| Rifqi | Authentication Subsystem |
| Fakhrul | Activity Tracking Subsystem |
| Aidil | Community Subsystem |
| Harith | Facility Subsystem |

# 👤 Authentication Subsystem
🧑‍💻Developer: MUHAMMAD RIFQI BIN RAZALI
| Sprint | Module Name | FrontEnd |
|--------|-------------|------|
| 1 | Activity Recording Module | [Login Screen](src/pages/LoginScreen.tsx) [Register Screen](src/pages/RegisterScreen.tsx) [Reset Password Request Screen](src/pages/ResetPasswordRequestScreen.tsx) [Reset Link Sent Screen](src/pages/ResetLinkSentScreen.tsx) [Reset Password New Screen](src/pages/ResetPasswordNewScreen.tsx)|

# 📊 Activity Tracking Subsystem
🧑‍💻Developer: MUHAMMAD FAKHRUL RAZZI BIN MD NOOR

| Sprint | Module Name | FrontEnd | Backend |
|:------:|:-----------:|:--------:|:-------:|
| 1 | Activity Recording Module | Pages <br> <ul><li>[Actvity Main Screen](src/pages/ActivityMainScreen.tsx)</li> <li>[Detail Activity Screen](src/pages/DetailActivityScreen.tsx)</li> <li>[Edit Actvity Screen](src/pages/EditActivityScreen.tsx)</li> <li>[Record Actvity Screen](src/pages/RecordActivityScreen.tsx)</li></ul> | Supabase Connection <br> [Supabase Client](src/lib/supabaseClient.ts) |



# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
