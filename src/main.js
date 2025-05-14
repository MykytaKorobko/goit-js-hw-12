import 'simplelightbox/dist/simple-lightbox.min.css';
import 'izitoast/dist/css/iziToast.min.css';

import { getImagesByQuery } from './js/pixabay-api';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions';

import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form');
const input = form.elements['search-text'];
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
let totalHits = 0;
const PER_PAGE = 15;

form.addEventListener('submit', async e => {
  e.preventDefault();
  query = input.value.trim();

  if (!query) {
    iziToast.warning({ message: 'Please enter a search query!' });
    return;
  }

  page = 1;
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    totalHits = data.totalHits;

    if (data.hits.length === 0) {
      iziToast.info({
        message: 'Sorry, there are no images matching your search query.',
      });
      return;
    }

    createGallery(data.hits);
    if (data.totalHits > PER_PAGE) showLoadMoreButton();
  } catch (error) {
    iziToast.error({ message: 'Something went wrong...' });
  } finally {
    hideLoader();
  }
});

loadMoreBtn.addEventListener('click', async () => {
  page += 1;
  showLoader();

  try {
    const data = await getImagesByQuery(query, page);
    createGallery(data.hits);

    scrollToNewContent();

    const totalPages = Math.ceil(totalHits / PER_PAGE);
    if (page >= totalPages) {
      hideLoadMoreButton();
      iziToast.info({
        message: `We're sorry, but you've reached the end of search results.`,
      });
    }
  } catch (error) {
    iziToast.error({ message: 'Failed to load more images.' });
  } finally {
    hideLoader();
  }
});

function scrollToNewContent() {
  const { height: cardHeight } = document
    .querySelector('.gallery-item')
    .getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}