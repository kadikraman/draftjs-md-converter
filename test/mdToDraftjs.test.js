const mdToDraftjs = require("../src/mdToDraftjs.js").mdToDraftjs;
const chai = require("chai");
const expect = chai.expect; // eslint-disable-line no-unused-vars
const should = chai.should(); // eslint-disable-line no-unused-vars

describe("mdToDraftjs", () => {
  it("returns empty text correctly", () => {
    const markdown = "";
    const expectedDraftjs = {
      blocks: [
        {
          text: "",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        }
      ],
      entityMap: {
        type: "",
        mutability: "",
        data: ""
      }
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it("returns unstyled text correctly", () => {
    const markdown = "There is no styling anywhere in this text.";
    const expectedDraftjs = {
      blocks: [
        {
          text: "There is no styling anywhere in this text.",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        }
      ],
      entityMap: {
        type: "",
        mutability: "",
        data: ""
      }
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it("converts bold markdown to draftjs blocks", () => {
    const markdown = "No style __bold__ no style.";
    const expectedDraftjs = {
      blocks: [
        {
          text: "No style bold no style.",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 9,
              length: 4,
              style: "BOLD"
            }
          ],
          entityRanges: []
        }
      ],
      entityMap: {
        type: "",
        mutability: "",
        data: ""
      }
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it("converts several italic markdown to draftjs blocks", () => {
    const markdown = "No style *italic* no style *more italic*.";
    const expectedDraftjs = {
      blocks: [
        {
          text: "No style italic no style more italic.",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 9,
              length: 6,
              style: "ITALIC"
            },
            {
              offset: 25,
              length: 11,
              style: "ITALIC"
            }
          ],
          entityRanges: []
        }
      ],
      entityMap: {
        type: "",
        mutability: "",
        data: ""
      }
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it("converts nested styles correctly", () => {
    const markdown = "I am a __text *with* nested__ styles.";
    const expectedDraftjs = {
      blocks: [
        {
          text: "I am a text with nested styles.",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 7,
              length: 5,
              style: "BOLD"
            },
            {
              offset: 12,
              length: 4,
              style: "BOLD"
            },
            {
              offset: 12,
              length: 4,
              style: "ITALIC"
            },
            {
              offset: 16,
              length: 7,
              style: "BOLD"
            }
          ],
          entityRanges: []
        }
      ],
      entityMap: {
        type: "",
        mutability: "",
        data: ""
      }
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it("converts two styles applied to the same word correctly", () => {
    const markdown = "__*Potato*__";
    const expectedDraftjs = {
      blocks: [
        {
          text: "Potato",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 0,
              length: 6,
              style: "BOLD"
            },
            {
              offset: 0,
              length: 6,
              style: "ITALIC"
            }
          ],
          entityRanges: []
        }
      ],
      entityMap: {
        type: "",
        mutability: "",
        data: ""
      }
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it("converts two styles applied to the a link correctly", () => {
    const markdown = "__*[label](http://example.com/here)*__";
    const expectedDraftjs = {
      blocks: [
        {
          text: "label",
          type: "unstyled",
          depth: 0,
          entityRanges: [
            {
              key: 0,
              length: 5,
              offset: 0
            }
          ],
          inlineStyleRanges: [
            {
              length: 0,
              offset: 0,
              style: "BOLD"
            },
            {
              length: 5,
              offset: 0,
              style: "ITALIC"
            }
          ]
        }
      ],
      entityMap: {
        0: {
          type: "LINK",
          mutability: "MUTABLE",
          data: { url: "http://example.com/here" }
        }
      }
    };

    const resultDraftJs = mdToDraftjs(markdown);
    resultDraftJs.should.deep.equal(expectedDraftjs);
  });

  it("converts several paragraphs to markdown correctly", () => {
    const markdown =
      "*First __content__* block.\n*Second __content__* block.\n*Third __content__* block.";
    const expectedDraftjs = {
      blocks: [
        {
          text: "First content block.",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 0,
              length: 6,
              style: "ITALIC"
            },
            {
              offset: 6,
              length: 7,
              style: "ITALIC"
            },
            {
              offset: 6,
              length: 7,
              style: "BOLD"
            }
          ],
          entityRanges: []
        },
        {
          text: "Second content block.",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 0,
              length: 7,
              style: "ITALIC"
            },
            {
              offset: 7,
              length: 7,
              style: "ITALIC"
            },
            {
              offset: 7,
              length: 7,
              style: "BOLD"
            }
          ],
          entityRanges: []
        },
        {
          text: "Third content block.",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 0,
              length: 6,
              style: "ITALIC"
            },
            {
              offset: 6,
              length: 7,
              style: "ITALIC"
            },
            {
              offset: 6,
              length: 7,
              style: "BOLD"
            }
          ],
          entityRanges: []
        }
      ],
      entityMap: {
        type: "",
        mutability: "",
        data: ""
      }
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it("converts markdown to unordered lists correctly", () => {
    const markdown = "- First\n- Second";
    const expectedDraftjs = {
      blocks: [
        {
          text: "First",
          type: "unordered-list-item",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          text: "Second",
          type: "unordered-list-item",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        }
      ],
      entityMap: {
        type: "",
        mutability: "",
        data: ""
      }
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it("converts markdown to ordered lists correctly", () => {
    const markdown = "1. First\n2. Second\n3. Third";
    const expectedDraftjs = {
      blocks: [
        {
          text: "First",
          type: "ordered-list-item",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          text: "Second",
          type: "ordered-list-item",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          text: "Third",
          type: "ordered-list-item",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        }
      ],
      entityMap: {
        type: "",
        mutability: "",
        data: ""
      }
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it("converts markdown to H1 - H6 correctly", () => {
    const markdown =
      "# One\n## Two\n### Three\n#### Four\n##### Five\n###### Six";
    const expectedDraftjs = {
      blocks: [
        {
          text: "One",
          type: "header-one",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          text: "Two",
          type: "header-two",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          text: "Three",
          type: "header-three",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          text: "Four",
          type: "header-four",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          text: "Five",
          type: "header-five",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          text: "Six",
          type: "header-six",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        }
      ],
      entityMap: {
        type: "",
        mutability: "",
        data: ""
      }
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it("converts markdown to code blocks correctly", () => {
    const markdown = "```\nconst country = Estonia;\n```";
    const expectedDraftjs = {
      blocks: [
        {
          text: "const country = Estonia;",
          type: "code-block",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        }
      ],
      entityMap: {
        type: "",
        mutability: "",
        data: ""
      }
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it("converts markdown to code blocks with inline styles correctly", () => {
    const markdown = "```\nconst *country* = Estonia;\n```";
    const expectedDraftjs = {
      blocks: [
        {
          text: "const *country* = Estonia;",
          type: "code-block",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        }
      ],
      entityMap: {
        type: "",
        mutability: "",
        data: ""
      }
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it("converts multiple markdown to code blocks correctly", () => {
    const markdown =
      "Cats are cool\n```\nPurr Purr 🐱\n```\nBut birds are too!\n```\nCaw-cawwww! 🐦\n```"; // eslint-disable-line max-len
    const expectedDraftjs = {
      blocks: [
        {
          text: "Cats are cool",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          text: "Purr Purr 🐱",
          type: "code-block",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          text: "But birds are too!",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          text: "Caw-cawwww! 🐦",
          type: "code-block",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        }
      ],
      entityMap: {
        type: "",
        mutability: "",
        data: ""
      }
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it("converts markdown to unclosed code blocks correctly", () => {
    const markdown = "```\nOh no, I only opened a code block";
    const expectedDraftjs = {
      blocks: [
        {
          text: "",
          type: "code-block",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        },
        {
          text: "Oh no, I only opened a code block",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        }
      ],
      entityMap: {
        type: "",
        mutability: "",
        data: ""
      }
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it("converts link entities to markdown correctly", () => {
    const markdown = "This is a [link](http://red-badger.com/) in text.";
    const expectedDraftjs = {
      entityMap: {
        0: {
          type: "LINK",
          mutability: "MUTABLE",
          data: {
            url: "http://red-badger.com/"
          }
        }
      },
      blocks: [
        {
          text: "This is a link in text.",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [
            {
              offset: 10,
              length: 4,
              key: 0
            }
          ]
        }
      ]
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it("converts markdown to several links correctly", () => {
    const markdown =
      "One [link](http://red-badger.com/). Two [links](http://red-badger.com/).";
    const expectedDraftjs = {
      entityMap: {
        0: {
          type: "LINK",
          mutability: "MUTABLE",
          data: {
            url: "http://red-badger.com/"
          }
        },
        1: {
          type: "LINK",
          mutability: "MUTABLE",
          data: {
            url: "http://red-badger.com/"
          }
        }
      },
      blocks: [
        {
          text: "One link. Two links.",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: [
            {
              offset: 4,
              length: 4,
              key: 0
            },
            {
              offset: 14,
              length: 5,
              key: 1
            }
          ]
        }
      ]
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  it("converts markdown to bold links correctly", () => {
    const markdown = "I am a __[bold](http://red-badger.com/)__ link.";
    const expectedDraftjs = {
      entityMap: {
        0: {
          type: "LINK",
          mutability: "MUTABLE",
          data: {
            url: "http://red-badger.com/"
          }
        }
      },
      blocks: [
        {
          text: "I am a bold link.",
          type: "unstyled",
          depth: 0,
          inlineStyleRanges: [
            {
              offset: 7,
              length: 4,
              style: "BOLD"
            }
          ],
          entityRanges: [
            {
              offset: 7,
              length: 4,
              key: 0
            }
          ]
        }
      ]
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });

  describe("Images", () => {
    it("converts markdown to image media correctly", () => {
      const markdown = "![My Image Name](//images.mine.com/myImage.jpg)";
      const expectedDraftjs = {
        entityMap: {
          0: {
            type: "IMAGE",
            mutability: "IMMUTABLE",
            data: {
              url: "//images.mine.com/myImage.jpg",
              src: "//images.mine.com/myImage.jpg",
              fileName: "My Image Name"
            }
          }
        },
        blocks: [
          {
            text: " ",
            type: "atomic",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [
              {
                offset: 0,
                length: 1,
                key: 0
              }
            ]
          }
        ]
      };
      mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
    });
  });

  describe("Videos", () => {
    it("converts markdown to video media correctly", () => {
      const markdown = "[[ embed url=//youtu.be/wfWIs2gFTAM ]]";
      const expectedDraftjs = {
        entityMap: {
          0: {
            type: "draft-js-video-plugin-video",
            mutability: "IMMUTABLE",
            data: {
              src: "//youtu.be/wfWIs2gFTAM"
            }
          }
        },
        blocks: [
          {
            text: " ",
            type: "atomic",
            depth: 0,
            inlineStyleRanges: [],
            entityRanges: [
              {
                offset: 0,
                length: 1,
                key: 0
              }
            ]
          }
        ]
      };
      mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
    });
  });

  it("converts markdown to block quotes correctly", () => {
    const markdown = "> Here is a block quote.";
    const expectedDraftjs = {
      entityMap: {
        data: "",
        mutability: "",
        type: ""
      },
      blocks: [
        {
          text: "Here is a block quote.",
          type: "blockquote",
          depth: 0,
          inlineStyleRanges: [],
          entityRanges: []
        }
      ]
    };
    mdToDraftjs(markdown).should.deep.equal(expectedDraftjs);
  });
});
