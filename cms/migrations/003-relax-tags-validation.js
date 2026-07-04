// The blogPost `tags` field was created by the mi-movilicemos project with
// an allowed-values validation (["general","javascript","static-sites"]).
// misionessim.org has 28 Spanish-language tags that don't fit that set —
// this migration removes the constraint so arbitrary tag strings can be stored.
module.exports = function (migration) {
  const blogPost = migration.editContentType("blogPost");
  blogPost.editField("tags").items({
    type: "Symbol",
    validations: [],
  });
};
