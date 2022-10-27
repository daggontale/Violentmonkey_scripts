// ==UserScript==
// @name        Post Date Checker for mojoPortal.com
// @namespace   https://github.com/daggontale/Violentmonkey_scripts
// @match       https://www.mojoportal.com/forums*
// @grant       none
// @license     MIT
// @version     1.0
// @author      Joey Stombaugh
// @description Checks mojoportal forums for a new post and notifies if so
// ==/UserScript==

const style = document.createElement('style');
style.innerHTML = '.card{position:fixed;top:50%;transform:translate(0,-50%);right:10px;border:1px solid gray;border-radius:5px;max-width:200px;background-color: aliceblue}.card__time{font-size:larger;text-align:center;border-bottom:1px solid gray;padding:5px 5px 3px}.card__body{padding:5px}';
document.head.appendChild(style);

const dateElementNodeList = document.querySelectorAll('.fpostdate');

const dateTitleArray = Array.from(dateElementNodeList).map(element => {

  const title = element.parentNode.querySelector('.ftitle > h3 > a:nth-child(3)')?.textContent;

  return {
      title,
      date: new Date(element.textContent)
  }
});

function removeDay(daysToRemove) {
  return new Date(new Date().getTime() - (8.64e+7 * daysToRemove));
}

const datesFromYesterdayArray = dateTitleArray.filter(x => {
  if (x.date > removeDay(1)) {
    return true;
  }
  return false;
});

const datesFromThisWeekArray = dateTitleArray.filter(x => {
  if (x.date > removeDay(5) && !datesFromYesterdayArray.includes(x)) {
      return true;
  }
  return false;
});

const currentPosts = []
const refreshTime = new Intl.DateTimeFormat('en-US', {timeStyle: 'short', hourCycle: 'h12' }).format(Date.now());
datesFromYesterdayArray.forEach(x => currentPosts.push(`New Post to ${x.title} in the last 24 hours. (${x.date.getMonth() + 1}/${x.date.getDate()}/${x.date.getFullYear()})`));
datesFromThisWeekArray.forEach(x => currentPosts.push(`New Post to ${x.title} in the past week. (${x.date.getMonth() + 1}/${x.date.getDate()}/${x.date.getFullYear()})`));

const notif = document.createElement('div');
notif.classList.add('card');

const cardTime = document.createElement('div');
cardTime.classList.add('card__time');
cardTime.innerText = refreshTime;

const posts = document.createElement('div');
posts.classList.add('card__body');

if (currentPosts.length == 0) {
	posts.innerText = 'No new posts.';
} else {
	posts.innerText = currentPosts;
}

document.body.appendChild(notif);
notif.appendChild(cardTime);
notif.appendChild(posts);

setTimeout(() => {
  location.reload();
}, 1800000);
