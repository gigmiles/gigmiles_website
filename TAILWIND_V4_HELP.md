# Documentation: Tailwind CSS v4 Lint False Positives

This project uses **Tailwind CSS v4**, which introduces new CSS at-rules that some IDEs (like VS Code or Cursor) and CSS linters may not yet recognize. 

The following warnings found in `src/app/globals.css` are **false positives** and should be ignored:

## Recognized at-rules in Tailwind v4:
- `@custom-variant`: Used for defining custom dark mode or other variants.
- `@theme`: Used for defining the project's design tokens and theme.
- `@utility`: Used for defining custom Tailwind utility classes.
- `@apply`: While standard, it's used extensively within Tailwind's layer system.

## Recommended IDE Setup:
To resolve these warnings in VS Code / Cursor:
1. Ensure the **Tailwind CSS IntelliSense** extension is installed and up to date.
2. If warnings persist, you can add the following to your `.vscode/settings.json`:
   ```json
   "css.lint.unknownAtRules": "ignore"
   ```

These rules are essential for the "Neon & Electric" design system and are correctly processed by the Tailwind v4 engine during build.
