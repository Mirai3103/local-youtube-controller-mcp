import type { GetSearchResultResponse } from "@shared/types";
import { SEARCH_RESULT_TIMEOUT, YOUTUBE_SEARCH_URL } from "@shared/constants";
import { waitForSelectorExists } from "../utils/dom-helpers";

/**
 * Scrape search results from YouTube search page
 */
export async function getSearchResult(): Promise<GetSearchResultResponse> {
  // Check if we're on a search page
  if (
    !window.location.href.includes(
      YOUTUBE_SEARCH_URL.replace("https://www.youtube.com", "")
    )
  ) {
    return {
      success: false,
      data: [],
    };
  }

  const searchResultCards = await waitForSelectorExists(
    "ytd-video-renderer.style-scope.ytd-item-section-renderer",
    SEARCH_RESULT_TIMEOUT
  );

  if (!searchResultCards) {
    return {
      success: false,
      data: [],
    };
  }

  const allResultCards = Array.from(
    document.querySelectorAll(
      "ytd-video-renderer.style-scope.ytd-item-section-renderer"
    )
  );

  const searchResult = allResultCards.map((card) => {
    const titleEl = card.querySelector("#video-title");
    const title = titleEl?.textContent?.trim() || "";
    const href = titleEl?.getAttribute("href") || "";
    const videoId = new URLSearchParams(href.split("?")[1]).get("v") || "";
    return { title, videoId };
  });

  return {
    success: true,
    data: searchResult,
  };
}

export async function doSearchAction(query: string): Promise<void> {
  console.log("Doing search action:", query);
  // find the search input element
  // <input class="ytSearchboxComponentInput yt-searchbox-input title" name="search_query" aria-controls="i0" aria-expanded="true" type="text" autocomplete="off" autocorrect="off" spellcheck="false" aria-autocomplete="list" role="combobox" placeholder="Search">
  const searchInput = document.querySelector(
    "input.ytSearchboxComponentInput.yt-searchbox-input.title"
  );
  if (!searchInput) {
    throw new Error("Search input not found");
  }
  // type the query into the search input
  (searchInput as HTMLInputElement).value = query;
  // submit the form
  const searchButton = document.querySelector(
    "button.ytSearchboxComponentSearchButton"
  ) as HTMLButtonElement;
  if (!searchButton) {
    throw new Error("Search button not found");
  }
  setTimeout(() => {
    searchButton.click();
  }, 500);
}

export async function clickResultHasId(videoId: string): Promise<void> {
  console.log("Clicking search result with videoId:", videoId);
  await waitForSelectorExists(
    "ytd-video-renderer.style-scope.ytd-item-section-renderer",
    SEARCH_RESULT_TIMEOUT
  );
  const resultLink = document.querySelector(
    `a#video-title[href*="${videoId}"]`
  ) as HTMLAnchorElement;
  if (!resultLink) {
    throw new Error(`Search result with videoId ${videoId} not found`);
  }
  resultLink.click();
}
