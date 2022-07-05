"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const altImg = "https://user-images.githubusercontent.com/24848110/33519396-7e56363c-d79d-11e7-969b-09782f5ccbab.png";
const $episodeList = $("#episodes-list");

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchTerm) {
  let searchResult = await axios.get(`http://api.tvmaze.com/search/shows?q=${searchTerm}`);
  let shows = searchResult.data.map(result => {
    let show = result.show;
    return { id: show.id, name: show.name, summary: show.summary, image: (show.image ? show.image.medium : altImg) };
  });
  return shows;
}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  $showsList.empty();

  for (let show of shows) {
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img 
              src=${show.image} 
              alt=${altImg}
              class="w-25 mr-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-secondary get-episodes">
               Episodes
             </button>
           </div>
         </div>  
       </div>
      `);

    $showsList.append($show);

  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#search-query").val();
  const shows = await getShowsByTerm(term);
  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  let result = await axios.get(`http://api.tvmaze.com/shows/${id}/episodes`);
  let episodes = result.data.map(episode => {
    return { id: episode.id, name: episode.name, season: episode.season, number: episode.number };
  });
  return episodes;
}

function populateEpisodes(episodes) {
  $episodeList.empty();

  for (let episode of episodes) {
    let $list = $(
      `<li>
        ${episode.name}
        (season ${episode.season}, episode ${episode.number})
      </li>`
    );
    $episodeList.append($list);
  }
  $episodesArea.show();
}

/** Write a clear docstring for this function... */
$showsList.on("click", ".get-episodes", async function (e) {
  e.preventDefault();
  let showID = $(e.target).closest(".Show").data("show-id");
  let episodes = await getEpisodesOfShow(showID);
  populateEpisodes(episodes);
});