require("dotenv").config();
const axios = require("axios");
const token = process.env.CRAFT_GRAPHQL_TOKEN;

/**
 * Format Data
 * @param {array} entriesArray - array of entry elements
 */
function formatData(entriesArray) {
  return entriesArray.map(item => ({
    date: item.postDate,
    title: item.title,
    slug: item.slug,
    intro: item.commonIntroRich,
    image: {
      alt: item.blogImage[0].title,
      thumb: item.blogImage[0].thumb,
      big: item.blogImage[0].big,
      medium: item.blogImage[0].medium,
      small: item.blogImage[0].small
    },
    body: item.commonBody
  }));
}

/**
 * Get all blogposts from GraphQL API
 */
async function getAllBlogposts() {
  try {
    const results = await axios({
      method: "post",
      url: "http://graphql.craft.test/api",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      data: {
        query: `
        {
          entries (
            section: "blog",
            orderBy: "postDate ASC"
          ) {
            postDate @formatDateTime (format: "Y-m-d"),
            title
            slug
            ... on blog_blogpost_Entry {
              commonIntroRich
              blogImage {
                thumb: url @transform (width: 400, height:400, immediately: true),
                big: url @transform (width: 1024, immediately: true),
                medium: url @transform (width: 800, immediately: true),
                small: url @transform (width: 600, immediately: true),
                title: title
              }
              commonBody
            }
          }
        }
        `
      }
    });

    // get response
    const response = await results.data;

    // handle Craft error messages
    if (response.errors) {
      response.errors.forEach(err => {
        console.log(err.message);
      });

      return [];
    }

    // format entries and return
    if (response.data.entries) {
      return formatData(response.data.entries);
    }
  } catch (error) {
    // general catch error
    throw new Error(error);
  }
}

module.exports = getAllBlogposts;
