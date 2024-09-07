# Blog Management Application

## Overview

This is a full stack blog management application built with Node.js, Express, and EJS. The application allows users to create, edit, and delete blog posts. It also handles the rendering of posts using EJS templates and manages post metadata using a JSON file.

## Features

- **Create Blog Posts**: Allows users to create new blog posts with a title and content.
- **Edit Blog Posts**: Enables users to edit existing posts, including changing the title.
- **Delete Blog Posts**: Provides functionality to delete posts.
- **Render Posts**: Displays posts on the main page and individual blog pages using EJS templates.
- **Error Handling**: Includes basic error handling for non-existent posts and server issues.

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)

### Getting Started

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/your-repository-name.git
   ```

2. **Navigate to the Project Directory**

   ```bash
   cd your-repository-name
   ```

3. **Install Dependencies**

   ```bash
   npm install
   ```

4. **Start the Server**

   ```bash
   npm start
   ```

   The application will be accessible at `http://localhost:3000`.

## Endpoints

### GET `/`

- **Description**: Displays the home page with a list of blog posts.
- **Response**: Renders `index.ejs` with a list of posts.

### GET `/about`

- **Description**: Displays the About page.
- **Response**: Renders `about.ejs`.

### GET `/create`

- **Description**: Displays the form to create a new blog post.
- **Response**: Renders `create.ejs`.

### POST `/create-file`

- **Description**: Creates a new blog post.
- **Request Body**:
  - `fileName`: The title of the new post.
  - `content`: The content of the post.

### GET `/blog/:fileName`

- **Description**: Displays a specific blog post.
- **Parameters**: `fileName` (the name of the blog post file).
- **Response**: Renders the post using `blog/:fileName.ejs`.

### GET `/edit/:fileName`

- **Description**: Displays the form to edit an existing blog post.
- **Parameters**: `fileName` (the name of the blog post file to be edited).
- **Response**: Renders `edit.ejs` with the existing post data.

### PUT `/edit-file/:filename`

- **Description**: Updates an existing blog post.
- **Parameters**: `filename` (the old file name of the post).
- **Request Body**:
  - `content`: The new content for the post.
  - `newFileName`: The new title for the post (optional).

### DELETE `/delete/:filename`

- **Description**: Deletes a blog post.
- **Parameters**: `filename` (the name of the blog post file to be deleted).

## File Structure

- `views/`
  - `blog/` - Directory for blog post EJS templates.
  - `partials/` - Directory for partial EJS templates (header, footer).
  - `index.ejs` - The homepage template.
  - `about.ejs` - The about page template.
  - `create.ejs` - The create post form template.
  - `edit.ejs` - The edit post form template.
  - `404.ejs` - The 404 error page template.
- `views/blog/posts.json` - JSON file to store metadata for blog posts.

## Usage

- **Creating a Post**: Navigate to `/create` to create a new blog post.
- **Editing a Post**: Navigate to `/edit/:fileName` to edit an existing post.
- **Deleting a Post**: The endpoint `/delete/:filename` handles deletion requests.

## Troubleshooting

- **Error Reading/Writing Posts File**: Check file permissions and ensure the `posts.json` file is accessible and writable.
- **File Deletion Issues**: Verify the file path and ensure the file exists before attempting deletion.

## Contributing

Feel free to fork the repository and submit pull requests. For major changes, please open an issue to discuss your proposed changes before submitting a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Express.js](https://expressjs.com/) - The web framework used.
- [EJS](https://www.npmjs.com/package/ejs) - The templating engine used.
- [Node.js](https://nodejs.org/) - The runtime environment used.
