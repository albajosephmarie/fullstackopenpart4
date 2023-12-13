const blogRouter = require("express").Router();
const logger = require("../utils/logger");
const jwt = require("jsonwebtoken");
const Blog = require("../models/blog");
const User = require("../models/user");

blogRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs.map((blog) => blog.toJSON()));
});

blogRouter.post("/", async (request, response) => {
  const body = request.body;

  const token = request.token;
  const decodedToken = jwt.verify(token, process.env.SECRET);

  const user = await User.findById(decodedToken.id);

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id,
  });

  const savedBlog = await blog.save();
  logger.info(`added ${blog.title} to the blog list`);
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  logger.info(`blog linked to user ${user.username}`);
  response.json(savedBlog.toJSON());
});

blogRouter.delete("/:id", async (request, response) => {
  const token = request.token;
  const decodedToken = jwt.verify(token, process.env.SECRET);

  const user = await User.findById(decodedToken.id);

  const blogToDelete = await Blog.findById(request.params.id);

  if (blogToDelete.user._id.toString() === user._id.toString()) {
    await Blog.findByIdAndRemove(request.params.id);
    response.status(204).end();
  } else {
    return response.status(401).json({ error: `Unauthorized` });
  }
});

blogRouter.put("/:id", async (request, response) => {
  const body = request.body;

  if (!body.likes) {
    body.likes = 0;
  }

  if (!body.comments) {
    body.comments = [];
  }

  const token = request.token;
  const decodedToken = jwt.verify(token, process.env.SECRET);
  const user = await User.findById(decodedToken.id);

  const blogToUpdate = await Blog.findById(request.params.id);

  if (blogToUpdate.user._id.toString() === user._id.toString()) {
    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
    };

    const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
      new: true,
    });
    logger.info(`blog ${blog.title} successfully updated`);
    response.json(updatedBlog.toJSON());
  } else {
    return response.status(401).json({ error: `Unauthorized` });
  }
});

module.exports = blogRouter;
