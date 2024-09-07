// app.js
import express from 'express';

import fs from 'fs'; // Node.js file system module
import bodyParser from 'body-parser';
import { dirname } from "path";
import { fileURLToPath } from "url";
import path from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;
var file_list = getFiles("views/blog");
// Middleware to parse JSON data from requests
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// get the name of all the blog posts that been created
function getFiles(dir, files = []) {
    // Get an array of all files and directories in the passed directory using fs.readdirSync
    const fileList = fs.readdirSync(dir)
    // Create the full path of the file/directory by concatenating the passed directory and file/directory name
    for (const file of fileList) {
        var name = `${dir}/${file}`
        if (name.includes("ejs")) {
            name = name.split("/")[2]
            name = name.split(".")[0]
            files.push(name)}
    }
    return files
}


function html_encode(input) {
    return input.split("<br>").join("\n");
  }

function convert_text_to_HTML(txt) {
    // Output variable
    let out = '';
    // Split text at the newline character into an array
    const txt_array = txt.split("\n");
    // Get the number of lines in the array
    const txt_array_length = txt_array.length;
    // Variable to keep track of the (non-blank) line number
    let non_blank_line_count = 0;
    
    for (let i = 0; i < txt_array_length; i++) {
      // Get the current line
      const line = txt_array[i];
      // Continue if a line contains no text characters
      if (line === ''){
        continue;
    }
      
      non_blank_line_count++;
      // If a line is the first line that contains text
      if (non_blank_line_count === 1){
        // ...wrap the line of text in a Heading 1 tag
        out += `<p>${line}</p>`;
        // ...otherwise, wrap the line of text in a Paragraph tag.
      } else {
        out += `<p>${line}</p>`;
      }
    }
  
    return out;
}
var stringer 
function convertString(input_string) {
    stringer = convert_images_and_links_to_HTML(convert_text_to_HTML(html_encode(input_string)));
  }

function convert_images_and_links_to_HTML(string){
  let urls_unique = [];
  let images_unique = [];
  const urls = string.match(/https*:\/\/[^\s<),]+[^\s<),.]/gmi) ?? [];
  const imgs = string.match(/[^"'>\s]+\.(jpg|jpeg|gif|png|webp)/gmi) ?? [];
                          
  const urls_length = urls.length;
  const images_length = imgs.length;
  
  for (let i = 0; i < urls_length; i++){
    const url = urls[i];
    if (!urls_unique.includes(url)){
      urls_unique.push(url);
    }
  }
  
  for (let i = 0; i < images_length; i++){
    const img = imgs[i];
    if (!images_unique.includes(img)){
      images_unique.push(img);
    }
  }
  
  const urls_unique_length = urls_unique.length;
  const images_unique_length = images_unique.length;
  
  for (let i = 0; i < urls_unique_length; i++){
    const url = urls_unique[i];
    if (images_unique_length === 0 || !images_unique.includes(url)){
      const a_tag = `<a href="${url}" target="_blank">${url}</a>`;
      string = string.replace(url, a_tag);
    }
  }
  
  for (let i = 0; i < images_unique_length; i++){
    const img = images_unique[i];
    const img_tag = `<img src="${img}" alt="">`;
    const img_link = `<a href="${img}">${img_tag}</a>`;
    string = string.replace(img, img_link);
  }
  return string;
}


function RefreshFiles(req, res, next) {
    file_list = getFiles("views/blog");
    next();
  } 



  function getRandomSubset(array, numItems) {
    // Check if the array length is less than the number of items requested
    if (array.length <= numItems) {
      return [...array]; // Return a copy of the array if it's shorter or equal in length
    }
  
    // Copy the array to avoid modifying the original
    const arrayCopy = [...array];
  
    // Fisher-Yates shuffle algorithm
    for (let i = arrayCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
    }
  
    // Return the first numItems items from the shuffled array
    return arrayCopy.slice(0, numItems);
  }




app.use(RefreshFiles);
app.get('/', (req, res) => {
    const selectedFiles = getRandomSubset(file_list, 7);
    res.render('index.ejs',  { activePage: '' , files_name : file_list , shuffle : selectedFiles});
});
app.get('/about', (req, res) => {
    res.render('about.ejs', { activePage: 'about' , files_name : file_list});
});

app.get('/create', (req, res) => {
    res.render('create.ejs', { activePage: 'create', files_name : file_list });
});
    



app.get('/blog/:fileName', (req, res) => {
    const file = decodeURIComponent(req.params.fileName);
    // Check if the requested file exists in the file_list
    if (file_list.includes(file)) {
        res.render("blog/" + file + ".ejs" ,  { activePage: file , files_name : file_list});
    } else {
      res.status(404);
      res.render('404.ejs' , {activePage: '404' , files_name : file_list});
    }
});    

// Handle POST request to create a file
app.post('/create-file', (req, res) => {
    // Extract file name and content from the request body
    const { fileName, content } = req.body;
    console.log(fileName, content);
    if (!fileName || !content) {
        return res.status(400).send('File name and content are required.');
    }
    if (file_list.includes(fileName)) {
        return res.status(400).send('Post name already exists.');
    }

    // Create template for the file
    const clean_name = fileName.trim();
    convertString(content);
    const template = `
    <%- include("../partials/header.ejs") %>
    <%- include("../partials/edit.ejs") %>
    <h1>${clean_name}</h1>
    <hr>
    ${stringer}
    <%- include("../partials/footer.ejs") %>
    `;

    // Path to posts.json
    const postsFilePath = path.join(__dirname, 'views', 'blog', 'posts.json');

    // Read the existing posts.json file
    fs.readFile(postsFilePath, 'utf8', (err, data) => {
        if (err && err.code !== 'ENOENT') {
            return res.status(500).send('Error reading posts file.');
        }

        let posts = {};

        if (data.trim() !== '') {
            try {
                // Parse the JSON data
                posts = JSON.parse(data);
            } catch (parseError) {
                return res.status(500).send('Error parsing posts file.');
            }
        }

        // Update or add the new post
        posts[fileName] = {
            title: fileName,
            content: content
        };

        // Write the updated data back to the file
        fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), (err) => {
            if (err) {
                return res.status(500).send('Error writing posts file.');
            }

            // Write the new EJS file
            const ejsFilePath = path.join(__dirname, 'views', 'blog', `${clean_name}.ejs`);
            fs.writeFile(ejsFilePath, template, (err) => {
                if (err) {
                    return res.status(500).send('Error writing EJS file.');
                }

                // Update file_list and return success
                file_list = getFiles("views/blog");
                res.json({ message: 'File created successfully', fileName: fileName });
            });
        });
    });
});














app.post('/delete-file', (req, res) => {
  console.log("delete")
  res.status(200).send('Deleted.');
})



app.delete('/delete/:filename', (req, res) => {
  const filename = req.params.filename +".ejs";
  const filePath = path.join(__dirname, 'views/blog', filename); // Assuming your files are in a 'files' directory

  fs.unlink(filePath, (err) => {
      if (err) {
          console.error('Error deleting file:', err);
          return res.status(500).json({ message: 'Failed to delete file' });
      }
      res.json({ message: 'File deleted successfully' });
  });
});



app.get('/edit/:fileName', (req, res) => {
  const fileName = decodeURIComponent(req.params.fileName);
  
  const postsFilePath = path.join(__dirname, 'views', 'blog', 'posts.json');
  
  // Read the JSON file to get the post content
  fs.readFile(postsFilePath, 'utf8', (err, data) => {
      if (err) {
          return res.status(500).send('Error reading the posts file.');
      }

      const posts = JSON.parse(data);
      const post = posts[fileName];
      
      if (!post) {
          return res.status(404).send('Post not found.');
      }

      // Render the edit form with the post data
      res.render('edit.ejs', { post, activePage: 'edit', files_name: file_list });
  });
});










app.put('/edit-file/:filename', (req, res) => {
  const oldFileName = decodeURIComponent(req.params.filename);
  const { content, newFileName } = req.body; // New file name if it was updated

  // Ensure newFileName is defined and handle the case where it might be missing
  const cleanNewFileName = (newFileName && newFileName.trim()) || oldFileName;

  // Convert the content string if needed
  convertString(content);

  const newTemplate = `
  <%- include("../partials/header.ejs") %>
  <%- include("../partials/edit.ejs") %>
  <h1>${cleanNewFileName}</h1>
  <hr>
  ${stringer}
  <%- include("../partials/footer.ejs") %>
  `;

  const oldFilePath = path.join(__dirname, 'views', 'blog', `${oldFileName}.ejs`);
  const newFilePath = path.join(__dirname, 'views', 'blog', `${cleanNewFileName}.ejs`);
  const postsFilePath = path.join(__dirname, 'views', 'blog', 'posts.json');

  // Read the posts.json file
  fs.readFile(postsFilePath, 'utf-8', (err, data) => {
      if (err) {
          console.error('Failed to read posts.json:', err);
          return res.status(500).send('Failed to read posts.json');
      }

      let posts;
      try {
          posts = JSON.parse(data);
      } catch (parseErr) {
          console.error('Failed to parse posts.json:', parseErr);
          return res.status(500).send('Failed to parse posts.json');
      }

      // Update the post content in the JSON
      if (oldFileName !== cleanNewFileName) {
          // If the filename has changed, delete the old one from JSON and add the new one
          delete posts[oldFileName];
      }
      posts[cleanNewFileName] = {
          title: cleanNewFileName,
          content: content
      };

      // Write the updated posts.json file
      fs.writeFile(postsFilePath, JSON.stringify(posts, null, 2), (err) => {
          if (err) {
              console.error('Failed to save the new post:', err);
              return res.status(500).send('Failed to save the new post');
          }

          // Write the new file
          fs.writeFile(newFilePath, newTemplate, (err) => {
              if (err) {
                  console.error('Failed to save the edited file:', err);
                  return res.status(500).send('Failed to save the edited file');
              }

              // If the file name has changed, delete the old file
              if (oldFileName !== cleanNewFileName) {
                  fs.unlink(oldFilePath, (err) => {
                      if (err) {
                          console.error('Error deleting old file:', err);
                          // Proceed with the response even if deletion fails
                          return res.status(500).send('Failed to delete the old file');
                      }

                      // Update file_list after deletion
                      file_list = getFiles("views/blog");

                      // Respond after successfully deleting the old file
                      res.json({ message: 'File updated and old file deleted successfully' });
                  });
              } else {
                  // Update file_list even if the file name hasn't changed
                  file_list = getFiles("views/blog");
                  res.json({ message: 'File updated successfully' });
              }
          });
      });
  });
});


app.all('*', (req, res) => {
    res.status(404)
    res.render('404.ejs' , {activePage: '404'});
  });


// Start the Express server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});



