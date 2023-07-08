# TODO

1. Check through:
    - `package.json`
    - `package-lock.json`
    - `eslintrc`
2. Update github:
    - See [Creating Tags](https://git-scm.com/book/en/v2/Git-Basics-Tagging#_creating_tags) - For Obsidian plugins, this must be the same as the version.
      - `git tag -a 1.0.1 -m "1.0.1"`
      - `git push origin 1.0.1`
    - Better issue templates using [yaml](https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/configuring-issue-templates-for-your-repository)
      - [Example 1](https://github.com/javalent/admonitions/tree/main/.github/ISSUE_TEMPLATE)
      - [Example 2](https://github.com/obsidian-tasks-group/obsidian-tasks/tree/main/.github/ISSUE_TEMPLATE)
      - [Example 3](https://github.com/actions/stale/blob/main/.github/ISSUE_TEMPLATE/config.yml)
      - [Example 4](https://github.com/blacksmithgu/obsidian-dataview/tree/master/.github/ISSUE_TEMPLATE)
    - `test.yml`
      - `npm run build`, `npm run test`, `npm run lint`
      - [Example 1](https://github.com/tgrosinger/advanced-tables-obsidian/blob/main/.github/workflows/main.yml)
      - [Example 2](https://github.com/chhoumann/quickadd/blob/master/.github/workflows/test.yml)
      - [Example 3](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/.github/workflows/verify.yml)
      - [Example 4](https://github.com/blacksmithgu/obsidian-dataview/blob/master/.github/workflows/test.yml)
    - Linting:
      - Update contributing and pull request template and readme
    - Documentation:
      - Actions:
        - [Example 1](https://github.com/obsidian-tasks-group/obsidian-tasks/blob/main/.github/workflows/update-docs-markdown.yml)
3. Debug iOS

## Consider

```css
/*! Wrap Live Preview Codeblock */
.HyperMD-codeblock:not(.cm-active):not(:hover) > .cm-hmd-codeblock {
    white-space: nowrap !important;
}
.markdown-source-view.mod-cm6 .block-language-preview code {
    white-space: pre-wrap !important;
}
```
