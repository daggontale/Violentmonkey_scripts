// ==UserScript==
// @name        WHMCS Ticket Watcher
// @namespace   https://github.com/daggontale/Violentmonkey_scripts
// @match       https://support.i7media.com/nv79/supporttickets.php
// @grant       none
// @version     2.2
// @author      Joey Stombaugh
// @description Highlights new tickets and notifies window after 1 minute.
// ==/UserScript==

// The constant definitions are in all caps just to help with case sensitivity.

// Watches for these ticket statuses.
const STATUS_LIST = ["CUSTOMER-REPLY", "OPEN"];

// Only looks for tickets with these assigned departments. Will look through all if empty.
const DEPARTMENT_LIST = ["TECHNICAL SUPPORT"];

// Must be a string. Ticket ids that will never be listed. Usually for tickets that joe and phillip are taking care of, but are not assigned directly to them.
const BLACKLIST = [];


function parseLastReply(string) {
	const days = /\d+(?=d)/.exec(string) * 8.64e+7;
	const hours = /\d+(?=h)/.exec(string) * 3.6e+6;
	const minutes = /\d+(?=m)/.exec(string) * 60000;

	return days + hours + minutes;
}

function createTicketObj(ticketNode) {
	return {
		dept: ticketNode.childNodes[2].textContent.toUpperCase().trim(),
		element: ticketNode,
		id: ticketNode.childNodes[3].innerText.slice(5, 10).trim(),
		lastReply: parseLastReply(ticketNode.childNodes[6].innerText),
		status: ticketNode.childNodes[5].textContent.toUpperCase().trim()
	};
}

function ticketFilter(ticketObject) {
	return (!BLACKLIST?.includes(ticketObject.id) && STATUS_LIST.includes(ticketObject.status) && DEPARTMENT_LIST.includes(ticketObject.dept));
}

const MATCHING_TICKETS = Array.from(document.querySelectorAll('[id*="sortabletbl"] > tbody > tr:not(:first-child)'))
	.map(x => createTicketObj(x))
	.filter(ticketFilter);

for (const ticket of MATCHING_TICKETS) {
	ticket.element.children[3].style.backgroundColor = 'yellow';

	if (ticket.lastReply < 4.32e+7) {
		ticket.element.children[6].style.backgroundColor = 'lime';
	} else if (ticket.lastReply >= 4.32e+7 && ticket.lastReply < 8.64e+7) {
		ticket.element.children[6].style.backgroundColor = 'yellow';
	} else if (ticket.lastReply >= 8.64e+7 && ticket.lastReply < 1.728e+8) {
		ticket.element.children[6].style.backgroundColor = 'orange';
	} else if (ticket.lastReply >= 1.728e+8) {
		ticket.element.children[6].style.backgroundColor = 'red';
		setInterval(() => {
			ticket.element.children[6].style.backgroundColor = 'yellow';
			setTimeout(() => { ticket.element.children[6].style.backgroundColor = 'red'; }, 500);
		}, 1000)
	}
}

console.log(MATCHING_TICKETS)

if (MATCHING_TICKETS.length > 0) {
	setTimeout(() => { alert('New Tickets') }, 60000);
}