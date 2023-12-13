const mongoose = require("mongoose");
const supertest = require("supertest");
const helper = require("./test_helper");
const app = require("../app");
const api = supertest(app);

const Blog = require("../models/blog");
const User = require("../models/user");

beforeEach(async () => {
  await User.deleteMany({});
  await Blog.deleteMany({});
  helper.initialBlogs.forEach(async (blog) => {
    let blogObject = new Blog(blog);
    await blogObject.save();
  });
});

describe("when there is initially some notes saved", () => {
  beforeEach(async () => {
    const newUser = {
      username: "root",
      name: "root",
      password: "password",
    };

    await api.post("/api/users").send(newUser);

    const result = await api.post("/api/login").send(newUser);

    headers = {
      Authorization: `bearer ${result.body.token}`,
    };
  });

  test("blogs are returned as json", async () => {
    await api
      .get("/api/blogs")
      .expect(200)
      .set(headers)
      .expect("Content-Type", /application\/json/);
  });

  test("all blogs are returned", async () => {
    const response = (await api.get("/api/blogs")).set(headers);

    expect(response.body).toHaveLength(blogsAtStart.length);
  });

  test("the unique identifier property of the blog posts is named id", async () => {
    const response = await api.get("/api/blogs");
    const blogObject = response.body[0];

    expect(blogObject.id).toBeDefined();

    expect(blogObject._id).toBeUndefined();
  });
});

describe("addition of a new note", () => {
  let headers;
  beforeEach(async () => {
    const newUser = {
      username: "root",
      name: "root",
      password: "password",
    };

    await api.post("/api/users").send(newUser);

    const result = await api.post("/api/login").send(newUser);

    headers = {
      Authorization: `bearer ${result.body.token}`,
    };
  });

  test("making an HTTP POST request to the /api/blogs URL successfully creates a new blog post", async () => {
    const newBlog = {
      title: "Type wars",
      author: "Robert C. Martin",
      url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
      likes: 2,
    };
    const blogsAtStart = await helper.blogsInDb();

    const response = await api
      .post("/api/blogs")
      .send(newBlog)
      .expect(201)
      .set(headers)
      .expect("Content-Type", /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length + 1);
    const { title, author, url, likes } = response.body;
    expect({ title, author, url, likes }).toEqual(newBlog);
  });

  test("verifies that if the likes property is missing from the request, it will default to the value 0", async () => {
    const blogWithoutLikes = {
      title: "Test Blog",
      author: "Test Author",
      url: "http://testurl.com",
    };

    const response = await api
      .post("/api/blogs")
      .send(blogWithoutLikes)
      .set(headers)
      .expect(201)
      .expect("Content-Type", /application\/json/);
    expect(response.body.likes).toBe(0);
  });

  test("responds with 400 Bad Request if title is missing", async () => {
    const blogWithoutTitle = {
      author: "Test Author",
      url: "http://testurl.com",
      likes: 5,
    };

    const response = await api
      .post("/api/blogs")
      .send(blogWithoutTitle)
      .set(headers)
      .expect(400);
  });

  test("4.12 responds with 400 Bad Request author is missing", async () => {
    const blogWithoutAuthor = {
      title: "Test Title",
      url: "http://testurl.com",
      likes: 5,
    };

    await api.post("/api/blogs").send(blogWithoutAuthor).set(headers).expect(400);
  });
});

describe("deletion of a blog", () => {
  let headers;

  beforeEach(async () => {
    const newUser = {
      username: "root",
      name: "root",
      password: "password",
    };

    await api.post("/api/users").send(newUser);

    const result = await api.post("/api/login").send(newUser);

    headers = {
      Authorization: `bearer ${result.body.token}`,
    };
  });  
  test("4.13 succeeds with status code 204 if id is valid", async () => {
    const blogsAtStart = await helper.blogsInDb();
    const blogToDelete = blogsAtStart[0];
    console.log("del", blogToDelete);
    await api.delete(`/api/blogs/${blogToDelete.id}`).set(headers).expect(204);
  });
});

describe("updatinig of a blog", () => {
  let headers;

  beforeEach(async () => {
    const newUser = {
      username: "root",
      name: "root",
      password: "password",
    };

    await api.post("/api/users").send(newUser);

    const result = await api.post("/api/login").send(newUser);

    headers = {
      Authorization: `bearer ${result.body.token}`,
    };
  });

  test("4.14 updating title and author of a blog", async () => {
    // Get an existing blog
    const blogsAtStart = await helper.blogsInDb();
    const blogToUpdate = blogsAtStart[0];

    const updatedBlog = {
      title: "New Title",
      author: "New Author",
      url: "new url",
      likes: blogToUpdate.likes + 1, // Increment likes by 1
    };

    // Perform the update
    const { body } = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedBlog)
      .set(headers)
      .expect(200)
      .expect("Content-Type", /application\/json/);
    console.log("body", body);
    // Check that the likes have been updated
    const blogsAtEnd = await helper.blogsInDb();
    const titles = blogsAtEnd.map((r) => r.title);
    expect(titles).toContain("New Title");
  });
});
