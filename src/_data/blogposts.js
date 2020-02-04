require("dotenv").config();
const axios = require("axios");

const token = process.env.CRAFT_GRAPHQL_TOKEN;
const endpointUrl = process.env.CRAFT_GRAPHQL_URL;

const graphqlQuery = `
query getAllBlogposts {
  entries (
    section: "blog",
    orderBy: "postDate DESC"
  ) {
    postDate @formatDateTime (format: "Y-m-d")
    title
    slug
    ... on blog_blogpost_Entry {
      commonIntro
      blogImage {
        small: url @transform (width: 600, height: 450, immediately: true)
        medium: url @transform (width: 1024, height: 768, immediately: true)
        large: url @transform (width: 1440, height: 1080, immediately: true)
        title: title
      }
      commonIntro
      commonBody
    }
  }
}
`;

/**
 * Format Data
 * @param {array} entriesArray - array of entries
 */
function formatData(entriesArray) {
  return entriesArray.map(item => ({
    date: item.postDate,
    title: item.title,
    slug: item.slug,
    intro: item.commonIntro,
    image: {
      alt: item.blogImage[0].title,
      large: item.blogImage[0].large,
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
    const response = await axios({
      method: "post",
      url: `${endpointUrl}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      data: {
        query: graphqlQuery
      }
    });

    // get response
    const data = response.data;

    // handle Craft error messages
    if (data.errors) {
      response.errors.forEach(err => {
        console.log(err.message);
      });

      return [];
    }

    // format entries and return
    if (data.data.entries) {
      return formatData(data.data.entries);
    }
  } catch (error) {
    // general catch error
    throw new Error(error);
  }
}

module.exports = getAllBlogposts;
