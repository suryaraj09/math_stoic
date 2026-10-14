# AI-Powered Application Development Workshop

**Build with AI → Save to GitHub → Branch → Modify → Preview → Compare → Review → Merge**

A beginner-friendly workshop for creating and improving web applications with **Google AI Studio, ChatGPT, GitHub, and Netlify**, without requiring participants to write code, open an IDE, or use a terminal.

## Goals

By the end of the workshop, participants should be able to:

- Create an initial application using prompts in Google AI Studio.
- Save the application in a GitHub repository.
- Explain the difference between the stable `main` branch and a feature branch.
- Create an issue and a feature branch through ChatGPT's GitHub connection.
- Request and commit a change **only on that feature branch**.
- Open branch-specific website previews, compare before and after, and review a pull request before merging.

> **Facilitator note:** Some capabilities depend on a participant's ChatGPT plan, GitHub connector availability, and repository permissions. Check access before the session. Prepare project hosting ahead of time.

## Tools

| Tool | Role |
| --- | --- |
| Google AI Studio | Generate and preview the initial application |
| GitHub | Source code, issues, branches, commits, pull requests |
| ChatGPT with GitHub access | Use natural language to inspect code and manage changes |
| Netlify | Deploy the approved application and feature branches to separate URLs |
| Optional comparison page | Present two working deployment URLs side-by-side |

GitHub branch previews are **not the same as Google AI Studio's preview**. AI Studio may synchronize only its selected/default project branch; do not rely on it to edit or preview arbitrary feature branches.

## How branches work

```text
                 main (approved version)
                  ├── button-to-red (experiment A)
                  └── new-homepage (experiment B)
```

Each branch preserves its own version of the project. Changes committed to `button-to-red` do **not** modify `main` until they are explicitly merged.

## Workshop steps

### 1. Build an application in Google AI Studio

Use natural language to generate the starting application. Example:

> Create a Socratic mathematics tutoring application with a welcome screen, a Start Session button, and a chat interface that helps students solve math problems step by step.

Test the generated app using AI Studio's own preview.

### 2. Save it to GitHub

Use AI Studio's available GitHub export/sync flow to create or connect a repository (for example, `math_stoic`). Ensure the initial version is committed to `main`.

### 3. Document a change as an issue

Ask ChatGPT:

> In my `math_stoic` repository, create an issue requesting that the Start Session button change from green to red. Include acceptance criteria.

An issue records the desired change without modifying the site.

### 4. Create a separate branch

Ask ChatGPT:

> Create a new branch named `button-to-red` from `main`. Don't change `main`.

### 5. Make the change on that branch

Ask ChatGPT:

> Implement Issue #1 on `button-to-red`: change the Start Session button to red, including its hover state. Commit only to `button-to-red`. Do not open a pull request or merge yet.

### 6. Preview each version visually

**One-time setup by facilitator:** Connect the GitHub repository to Netlify, configure the build/output settings, turn on branch deployments for the intended branches, and test both URLs. An application with an Express backend or external APIs may need additional deployment adaptation and securely configured environment variables.

Open the production/main URL to see the original version; open the `button-to-red` branch deployment URL to see the experiment. Netlify assigns branch-specific URLs when branch deployment is configured. Exact URL formats depend on the site and deployment settings.

| Before | After |
| --- | --- |
| Branch: `main` | Branch: `button-to-red` |
| Original button color | Red button |
| Approved application | Proposed experiment |

The goal is for participants to **click preview links**, not interact with a code editor. If desired, a dedicated visual comparison page can display both deployments side by side, subject to browser embedding policies; otherwise open two browser tabs.

### 7. Review changes through a pull request

Once the preview looks correct, ask ChatGPT:

> Open a pull request from `button-to-red` into `main`. Reference Issue #1 and summarize the change. Do not merge it yet.

A pull request proposes a merge; it doesn't automatically perform one.

### 8. Approve and merge

Review the pull request and visual preview, then merge it using GitHub or an available authorized integration. The production deployment updates after the change reaches `main` and the build succeeds. Close the issue when the work is complete.

## Sample exercise: Start Session button

**Challenge:** Change the button color while protecting the original application.

**Completion checklist:**

- [ ] Initial app exists on `main`.
- [ ] GitHub issue describes the change.
- [ ] `button-to-red` branch exists.
- [ ] Change is committed on the feature branch, not `main`.
- [ ] Both versions have working preview links.
- [ ] Participant visually compares the two versions.
- [ ] Pull request is reviewed before any merge.

## Optional visual comparison dashboard

A simple, non-technical dashboard could expose only these controls:

- Repository selector
- **Before** branch selector
- **After** branch selector
- Two live website previews (or links to open them)
- Deployment status (building, ready, failed)
- Refresh/open-preview actions

This dashboard is a **future enhancement**, not a feature already included in this repository.

## Important limitations and safeguards

- **No IDE or terminal for attendees:** A facilitator handles hosting configuration and any infrastructure fixes beforehand.
- **Access differs by account:** ChatGPT GitHub write actions may not be available for every participant.
- **Backend compatibility:** A React frontend may deploy easily, but Express APIs, authentication, databases, or image uploads can require additional hosting or serverless adaptation.
- **Secrets:** Never put API keys or database credentials in frontend code or commit them to GitHub. Configure backend environment variables securely.
- **Costs and quotas:** Check platform free-tier limits and expected workshop usage.
- **Branch preview readiness:** Changes become visible only when the branch deployment completes successfully.
- **Review before merge:** Keep `main` untouched until participants approve the experiment.

## Workshop vision

Make professional software-development concepts accessible through natural-language instructions and visual feedback:

**Create → Experiment safely → Compare → Approve → Publish.**

The goal is not to hide the concepts of branching, versioning, and review; it's to teach them without requiring participants to become programmers first.
