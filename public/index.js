document.addEventListener("DOMContentLoaded", () => {
    loadHome();
  
    document.getElementById('uploadLink').addEventListener('click', (e) => {
      e.preventDefault();
      loadUploadForm();
    });
  });
  
  function loadHome() {
    axios.get('http://localhost:5000/videos')
      .then(response => {
        const videos = response.data;
        const content = document.getElementById('content');
        content.innerHTML = `
          <h1>All Videos</h1>
          <div class="row">
            ${videos.map(video => `
              <div class="col-md-4">
                <div class="card mb-4">
                  <video controls class="card-img-top">
                    <source src="http://localhost:5000/${video.fileUrl}" type="video/mp4">
                  </video>
                  <div class="card-body">
                    <h5 class="card-title">${video.title}</h5>
                    <p class="card-text">${video.description}</p>
                    <button class="btn btn-primary" onclick="loadVideoDetail('${video._id}')">View Details</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      })
      .catch(error => console.error(error));
  }
  
  function loadUploadForm() {
    const content = document.getElementById('content');
    content.innerHTML = `
      <h1>Upload Video</h1>
      <form id="uploadForm">
        <div class="form-group">
          <label for="title">Title</label>
          <input type="text" class="form-control" id="title" required>
        </div>
        <div class="form-group">
          <label for="description">Description</label>
          <textarea class="form-control" id="description" required></textarea>
        </div>
        <div class="form-group">
          <label for="video">Video</label>
          <input type="file" class="form-control" id="video" required>
        </div>
        <button type="submit" class="btn btn-primary">Upload</button>
      </form>
    `;
  
    document.getElementById('uploadForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append('video', document.getElementById('video').files[0]);
      formData.append('title', document.getElementById('title').value);
      formData.append('description', document.getElementById('description').value);
  
      axios.post('http://localhost:5000/upload', formData)
        .then(response => {
          alert('Video uploaded successfully!');
          loadHome();
        })
        .catch(error => {
          console.error(error);
          alert('Failed to upload video.');
        });
    });
  }
  
  function loadVideoDetail(id) {
    axios.get(`http://localhost:5000/videos/${id}`)
      .then(response => {
        const video = response.data;
        const content = document.getElementById('content');
        content.innerHTML = `
          <h1>${video.title}</h1>
          <video controls class="w-100">
            <source src="http://localhost:5000/${video.fileUrl}" type="video/mp4">
          </video>
          <div class="mt-3">
            <button class="btn btn-primary" onclick="likeVideo('${video._id}')">Like (${video.likes})</button>
          </div>
          <div class="mt-3">
            <h3>Comments</h3>
            <form id="commentForm">
              <div class="form-group">
                <input type="text" class="form-control" id="user" placeholder="Your name" required>
              </div>
              <div class="form-group">
                <textarea class="form-control" id="comment" placeholder="Your comment" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary">Submit</button>
            </form>
            <ul class="list-group mt-3">
              ${video.comments.map(comment => `
                <li class="list-group-item">
                  <strong>${comment.user}:</strong> ${comment.comment}
                </li>
              `).join('')}
            </ul>
          </div>
        `;
  
        document.getElementById('commentForm').addEventListener('submit', (e) => {
          e.preventDefault();
          const user = document.getElementById('user').value;
          const comment = document.getElementById('comment').value;
  
          axios.post(`http://localhost:5000/comment/${id}`, { user, comment })
            .then(response => {
              loadVideoDetail(id);
            })
            .catch(error => {
              console.error(error);
              alert('Failed to submit comment.');
            });
        });
      })
      .catch(error => console.error(error));
  }
  
  function likeVideo(id) {
    axios.post(`http://localhost:5000/like/${id}`)
      .then(response => {
        loadVideoDetail(id);
      })
      .catch(error => console.error(error));
  }
  