import { Right } from 'fp-ts/Either'

import { KlkPost } from '../../../src/server/models/KlkPost'
import { Link } from '../../../src/server/models/Link'
import { KlkPostId } from '../../../src/shared/models/klkPost/KlkPostId'
import { Either, Maybe } from '../../../src/shared/utils/fp'

const image = `{
  "kind": "t3",
  "data": {
    "approved_at_utc": null,
    "subreddit": "KillLaKill",
    "selftext": "",
    "author_fullname": "t2_tmnbp",
    "saved": false,
    "mod_reason_title": null,
    "gilded": 0,
    "clicked": false,
    "title": "Senketsu (from Episode 21) [1920x2125]",
    "link_flair_richtext": [],
    "subreddit_name_prefixed": "r/KillLaKill",
    "hidden": false,
    "pwls": 6,
    "link_flair_css_class": null,
    "downs": 0,
    "thumbnail_height": 140,
    "top_awarded_type": null,
    "hide_score": false,
    "name": "t3_je3de8",
    "quarantine": false,
    "link_flair_text_color": "dark",
    "upvote_ratio": 0.96,
    "author_flair_background_color": null,
    "subreddit_type": "public",
    "ups": 58,
    "total_awards_received": 0,
    "media_embed": {},
    "thumbnail_width": 140,
    "author_flair_template_id": null,
    "is_original_content": false,
    "user_reports": [],
    "secure_media": null,
    "is_reddit_media_domain": false,
    "is_meta": false,
    "category": null,
    "secure_media_embed": {},
    "link_flair_text": null,
    "can_mod_post": false,
    "score": 58,
    "approved_by": null,
    "author_premium": false,
    "thumbnail": "https://a.thumbs.redditmedia.com/SztFS440b23i3GCV8y8hQk4IgskFvbX3ztp43X6Dgg0.jpg",
    "edited": false,
    "author_flair_css_class": null,
    "author_flair_richtext": [],
    "gildings": {},
    "post_hint": "image",
    "content_categories": null,
    "is_self": false,
    "mod_note": null,
    "created": 1603148934.0,
    "link_flair_type": "text",
    "wls": 6,
    "removed_by_category": null,
    "banned_by": null,
    "author_flair_type": "text",
    "domain": "i.imgur.com",
    "allow_live_comments": false,
    "selftext_html": null,
    "likes": true,
    "suggested_sort": null,
    "banned_at_utc": null,
    "url_overridden_by_dest": "https://i.imgur.com/Pb5mmsq.jpg",
    "view_count": null,
    "archived": false,
    "no_follow": false,
    "is_crosspostable": true,
    "pinned": false,
    "over_18": false,
    "preview": {
      "images": [
        {
          "source": {
            "url": "https://external-preview.redd.it/l1MBcPLHXI6s5Eymm-8yeNz5sKd2jZwK_cWL8D_voE0.jpg?auto=webp&amp;s=aa3c11b96f660c790f771b300e27306849a492c8",
            "width": 1920,
            "height": 2125
          },
          "resolutions": [
            {
              "url": "https://external-preview.redd.it/l1MBcPLHXI6s5Eymm-8yeNz5sKd2jZwK_cWL8D_voE0.jpg?width=108&amp;crop=smart&amp;auto=webp&amp;s=bf5137f5bbc4be183f5bdfa589b3219bb16c7bb6",
              "width": 108,
              "height": 119
            },
            {
              "url": "https://external-preview.redd.it/l1MBcPLHXI6s5Eymm-8yeNz5sKd2jZwK_cWL8D_voE0.jpg?width=216&amp;crop=smart&amp;auto=webp&amp;s=e0031e1cd1764152d45812b87511bc05da110906",
              "width": 216,
              "height": 239
            },
            {
              "url": "https://external-preview.redd.it/l1MBcPLHXI6s5Eymm-8yeNz5sKd2jZwK_cWL8D_voE0.jpg?width=320&amp;crop=smart&amp;auto=webp&amp;s=bf36733094fa9581b0ab6c994182f049548ba0e8",
              "width": 320,
              "height": 354
            },
            {
              "url": "https://external-preview.redd.it/l1MBcPLHXI6s5Eymm-8yeNz5sKd2jZwK_cWL8D_voE0.jpg?width=640&amp;crop=smart&amp;auto=webp&amp;s=80886cdb78c4d04b680aaf1a20794cf2e0cb3d85",
              "width": 640,
              "height": 708
            },
            {
              "url": "https://external-preview.redd.it/l1MBcPLHXI6s5Eymm-8yeNz5sKd2jZwK_cWL8D_voE0.jpg?width=960&amp;crop=smart&amp;auto=webp&amp;s=9b648fe8df1ff49074c378c51921b5264925f9de",
              "width": 960,
              "height": 1062
            },
            {
              "url": "https://external-preview.redd.it/l1MBcPLHXI6s5Eymm-8yeNz5sKd2jZwK_cWL8D_voE0.jpg?width=1080&amp;crop=smart&amp;auto=webp&amp;s=9570ace1158e0446dc9dfe150fb14ad93c8fac45",
              "width": 1080,
              "height": 1195
            }
          ],
          "variants": {},
          "id": "N41cJC45Kq4h5QXMLQPEnyLIP5dTPyoDgEVLRvSdKo8"
        }
      ],
      "enabled": true
    },
    "all_awardings": [],
    "awarders": [],
    "media_only": false,
    "can_gild": true,
    "spoiler": false,
    "locked": false,
    "author_flair_text": null,
    "treatment_tags": [],
    "visited": false,
    "removed_by": null,
    "num_reports": null,
    "distinguished": null,
    "subreddit_id": "t5_2yn47",
    "mod_reason_by": null,
    "removal_reason": null,
    "link_flair_background_color": "",
    "id": "je3de8",
    "is_robot_indexable": true,
    "report_reasons": null,
    "author": "iamonlyoneman",
    "discussion_type": null,
    "num_comments": 1,
    "send_replies": true,
    "whitelist_status": "all_ads",
    "contest_mode": false,
    "mod_reports": [],
    "author_patreon_flair": false,
    "author_flair_text_color": null,
    "permalink": "/r/KillLaKill/comments/je3de8/senketsu_from_episode_21_1920x2125/",
    "parent_whitelist_status": "all_ads",
    "stickied": false,
    "url": "https://i.imgur.com/Pb5mmsq.jpg",
    "subreddit_subscribers": 61829,
    "created_utc": 1603120134.0,
    "num_crossposts": 0,
    "media": null,
    "is_video": false
  }
}`

const link = `{
  "kind": "t3",
  "data": {
    "approved_at_utc": null,
    "subreddit": "KillLaKill",
    "selftext": "",
    "author_fullname": "t2_tmnbp",
    "saved": false,
    "mod_reason_title": null,
    "gilded": 0,
    "clicked": false,
    "title": "Mako (from Episode 21) minor [spoiler] [1920x2096]",
    "link_flair_richtext": [],
    "subreddit_name_prefixed": "r/KillLaKill",
    "hidden": false,
    "pwls": 6,
    "link_flair_css_class": null,
    "downs": 0,
    "thumbnail_height": 73,
    "top_awarded_type": null,
    "hide_score": false,
    "name": "t3_je3d3k",
    "quarantine": false,
    "link_flair_text_color": "dark",
    "upvote_ratio": 0.92,
    "author_flair_background_color": null,
    "subreddit_type": "public",
    "ups": 26,
    "total_awards_received": 0,
    "media_embed": {},
    "thumbnail_width": 140,
    "author_flair_template_id": null,
    "is_original_content": false,
    "user_reports": [],
    "secure_media": null,
    "is_reddit_media_domain": false,
    "is_meta": false,
    "category": null,
    "secure_media_embed": {},
    "link_flair_text": null,
    "can_mod_post": false,
    "score": 26,
    "approved_by": null,
    "author_premium": false,
    "thumbnail": "spoiler",
    "edited": false,
    "author_flair_css_class": null,
    "author_flair_richtext": [],
    "gildings": {},
    "post_hint": "link",
    "content_categories": null,
    "is_self": false,
    "mod_note": null,
    "created": 1603148909.0,
    "link_flair_type": "text",
    "wls": 6,
    "removed_by_category": null,
    "banned_by": null,
    "author_flair_type": "text",
    "domain": "imgur.com",
    "allow_live_comments": false,
    "selftext_html": null,
    "likes": true,
    "suggested_sort": null,
    "banned_at_utc": null,
    "url_overridden_by_dest": "https://imgur.com/cHZ6iZW",
    "view_count": null,
    "archived": false,
    "no_follow": false,
    "is_crosspostable": true,
    "pinned": false,
    "over_18": false,
    "preview": {
      "images": [
        {
          "source": {
            "url": "https://external-preview.redd.it/VsAkWmYjpSXZRTkpcvWienuQeH3kCmwxfKe_5yWCJmU.jpg?auto=webp&amp;s=a283539113cb46cee92c21887c5abcc1f1618352",
            "width": 600,
            "height": 315
          },
          "resolutions": [
            {
              "url": "https://external-preview.redd.it/VsAkWmYjpSXZRTkpcvWienuQeH3kCmwxfKe_5yWCJmU.jpg?width=108&amp;crop=smart&amp;auto=webp&amp;s=d4bfd29a99dbd6aba4a1f94157818a6a1b4cad41",
              "width": 108,
              "height": 56
            },
            {
              "url": "https://external-preview.redd.it/VsAkWmYjpSXZRTkpcvWienuQeH3kCmwxfKe_5yWCJmU.jpg?width=216&amp;crop=smart&amp;auto=webp&amp;s=d6c502bb2df1f24528a4949ffc616d4bbba1cdcf",
              "width": 216,
              "height": 113
            },
            {
              "url": "https://external-preview.redd.it/VsAkWmYjpSXZRTkpcvWienuQeH3kCmwxfKe_5yWCJmU.jpg?width=320&amp;crop=smart&amp;auto=webp&amp;s=075935b1ba477780bca679e36a0e75dceb79ee17",
              "width": 320,
              "height": 168
            }
          ],
          "variants": {
            "obfuscated": {
              "source": {
                "url": "https://external-preview.redd.it/VsAkWmYjpSXZRTkpcvWienuQeH3kCmwxfKe_5yWCJmU.jpg?blur=40&amp;format=pjpg&amp;auto=webp&amp;s=4b441719c5ff6db0030c2d77442ec972f3120df5",
                "width": 600,
                "height": 315
              },
              "resolutions": [
                {
                  "url": "https://external-preview.redd.it/VsAkWmYjpSXZRTkpcvWienuQeH3kCmwxfKe_5yWCJmU.jpg?width=108&amp;crop=smart&amp;blur=10&amp;format=pjpg&amp;auto=webp&amp;s=7f1bf56ce4fe002f775e719db068be25a75ef3a0",
                  "width": 108,
                  "height": 56
                },
                {
                  "url": "https://external-preview.redd.it/VsAkWmYjpSXZRTkpcvWienuQeH3kCmwxfKe_5yWCJmU.jpg?width=216&amp;crop=smart&amp;blur=21&amp;format=pjpg&amp;auto=webp&amp;s=b507b0478760689f7cc7e3e66715934f1920b477",
                  "width": 216,
                  "height": 113
                },
                {
                  "url": "https://external-preview.redd.it/VsAkWmYjpSXZRTkpcvWienuQeH3kCmwxfKe_5yWCJmU.jpg?width=320&amp;crop=smart&amp;blur=32&amp;format=pjpg&amp;auto=webp&amp;s=457bcd6ae64ad455007c42c059783c040317a109",
                  "width": 320,
                  "height": 168
                }
              ]
            }
          },
          "id": "ihQIqXg0NJAcvuOczJUFGNbPwVft74l7A0711oTqHRg"
        }
      ],
      "enabled": false
    },
    "all_awardings": [],
    "awarders": [],
    "media_only": false,
    "can_gild": true,
    "spoiler": true,
    "locked": false,
    "author_flair_text": null,
    "treatment_tags": [],
    "visited": false,
    "removed_by": null,
    "num_reports": null,
    "distinguished": null,
    "subreddit_id": "t5_2yn47",
    "mod_reason_by": null,
    "removal_reason": null,
    "link_flair_background_color": "",
    "id": "je3d3k",
    "is_robot_indexable": true,
    "report_reasons": null,
    "author": "iamonlyoneman",
    "discussion_type": null,
    "num_comments": 2,
    "send_replies": true,
    "whitelist_status": "all_ads",
    "contest_mode": false,
    "mod_reports": [],
    "author_patreon_flair": false,
    "author_flair_text_color": null,
    "permalink": "/r/KillLaKill/comments/je3d3k/mako_from_episode_21_minor_spoiler_1920x2096/",
    "parent_whitelist_status": "all_ads",
    "stickied": false,
    "url": "https://imgur.com/cHZ6iZW",
    "subreddit_subscribers": 61829,
    "created_utc": 1603120109.0,
    "num_crossposts": 0,
    "media": null,
    "is_video": false
  }
}`

describe('Link.decoder', () => {
  it('should decode image', () => {
    const parsed = Link.decoder.decode(JSON.parse(image))
    expect(parsed).toEqual(
      Either.right({
        kind: 't3',
        data: {
          id: KlkPostId.wrap('je3de8'),
          subreddit_name_prefixed: 'r/KillLaKill',
          author: 'iamonlyoneman',
          title: 'Senketsu (from Episode 21) [1920x2125]',
          created_utc: 1603120134,
          permalink: '/r/KillLaKill/comments/je3de8/senketsu_from_episode_21_1920x2125/',
          url: 'https://i.imgur.com/Pb5mmsq.jpg',
          post_hint: 'image',
        },
      }),
    )
    expect(KlkPost.fromLink((parsed as Right<Link>).right)).toEqual({
      id: KlkPostId.wrap('je3de8'),
      url: 'https://i.imgur.com/Pb5mmsq.jpg',
      title: 'Senketsu (from Episode 21) [1920x2125]',
      episode: Maybe.some(21),
      size: Maybe.some({ width: 1920, height: 2125 }),
      createdAt: new Date(1603120134000),
      permalink: '/r/KillLaKill/comments/je3de8/senketsu_from_episode_21_1920x2125/',
      active: true,
    })
  })

  it('should decode link', () => {
    const parsed = Link.decoder.decode(JSON.parse(link))
    expect(parsed).toEqual(
      Either.right({
        kind: 't3',
        data: {
          id: KlkPostId.wrap('je3d3k'),
          subreddit_name_prefixed: 'r/KillLaKill',
          author: 'iamonlyoneman',
          title: 'Mako (from Episode 21) minor [spoiler] [1920x2096]',
          created_utc: 1603120109,
          permalink: '/r/KillLaKill/comments/je3d3k/mako_from_episode_21_minor_spoiler_1920x2096/',
          url: 'https://imgur.com/cHZ6iZW',
          post_hint: 'link',
        },
      }),
    )
    expect(KlkPost.fromLink((parsed as Right<Link>).right)).toEqual({
      id: KlkPostId.wrap('je3d3k'),
      url: 'https://i.imgur.com/cHZ6iZW.jpg',
      title: 'Mako (from Episode 21) minor [spoiler] [1920x2096]',
      episode: Maybe.some(21),
      size: Maybe.some({ width: 1920, height: 2096 }),
      createdAt: new Date(1603120109000),
      permalink: '/r/KillLaKill/comments/je3d3k/mako_from_episode_21_minor_spoiler_1920x2096/',
      active: true,
    })
  })
})
