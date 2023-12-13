const _ = require("lodash");

const dummy = (blogs) => {
  return 1;
};

const totalLikes = (blogs) => {
  return blogs.reduce((total, blog) => total + blog.likes, 0);
};

const favoriteBlog = (blogs) => {
  return blogs.reduce(
    (favorite, blog) =>
      blog.likes >= favorite.likes
        ? { title: blog.title, author: blog.author, likes: blog.likes }
        : favorite,
    { title: "", author: "", likes: 0 }
  );
};

const mostBlogs = (blogs) => {
  const blogCounts = _.countBy(blogs, "author");
  const topAuthor = _.maxBy(_.keys(blogCounts), (author) => blogCounts[author]);
  return {
    author: topAuthor,
    blogs: blogCounts[topAuthor],
  };
};

const mostLikes = (blogs) => {
  const blogsByAuthor = _.groupBy(blogs, "author");
  const authorsWithLikes = _.map(blogsByAuthor, (blogs, author) => ({
    author,
    likes: _.sumBy(blogs, "likes"),
  }));
  const topAuthor = _.maxBy(authorsWithLikes, "likes");
  return {
    author: topAuthor.author,
    likes: topAuthor.likes,
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
};
