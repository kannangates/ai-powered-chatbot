# Moving the Project to GitHub

Follow these steps to move your AI-powered chatbot project from Replit to your GitHub account:

## 1. Create a New GitHub Repository

1. Log in to your GitHub account
2. Click the "+" icon in the top right corner and select "New repository"
3. Enter a repository name (e.g., "ai-powered-chatbot")
4. Add a description (optional)
5. Choose whether to make the repository public or private
6. Click "Create repository"

## 2. Set Up Git in Your Replit Project

Replit projects come with Git pre-installed. You'll need to configure your Git identity:

```bash
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
```

## 3. Initialize Git Repository (If Not Already Done)

```bash
git init
```

## 4. Add the Remote GitHub Repository

Replace `YOUR_USERNAME` with your GitHub username and `REPOSITORY_NAME` with the name of your new repository:

```bash
git remote add origin https://github.com/YOUR_USERNAME/REPOSITORY_NAME.git
```

## 5. Create a .gitignore File

Create a `.gitignore` file to avoid committing unnecessary files:

```
node_modules/
.env
.env.local
.replit
.cache/
dist/
.DS_Store
```

## 6. Add, Commit, and Push Your Code

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

Note: If you're on the `master` branch instead of `main`, use:

```bash
git push -u origin master
```

## 7. Verify Your Repository

Visit your GitHub repository to verify that all files have been pushed correctly.

## 8. Setting Up Secrets on GitHub

If you plan to deploy this application, you'll need to set up the following secrets:

1. Go to your repository settings
2. Click on "Secrets and variables" → "Actions"
3. Add the following secrets:
   - `OPENAI_API_KEY`
   - `GEMINI_API_KEY`

## 9. Clone the Repository to Your Local Machine

To work with the repository locally, clone it to your machine:

```bash
git clone https://github.com/YOUR_USERNAME/REPOSITORY_NAME.git
cd REPOSITORY_NAME
npm install
```

## 10. Handling Replit-Specific Code

Note that this project was developed on Replit and some parts are specific to the Replit environment. If you plan to deploy elsewhere, you may need to modify:

- Port settings (Replit sets these automatically)
- Environment variable handling
- Path references

## Next Steps

Once your code is on GitHub, you can:

1. Set up a CI/CD pipeline using GitHub Actions
2. Deploy to a hosting provider like Vercel, Netlify, or Heroku
3. Add collaborators to your repository
4. Create issues and track feature development

## Troubleshooting

If you encounter issues with the push to GitHub:
- Ensure you have the correct permissions for the repository
- Check if you're using HTTPS or SSH for the remote URL
- Make sure your GitHub token or credentials are valid