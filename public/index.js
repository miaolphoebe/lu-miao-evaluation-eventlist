const API = (function () {
  const API_URL = 'http://localhost:3000/events';

  const getEvents = async () => {
    const res = await fetch(`${API_URL}`);
    return await res.json();
  };

  const postEvent = async (newEvent) => {
    const res = await fetch(`${API_URL}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(newEvent),
    });
    return await res.json();
  };

  const updateEvent = async (event) => {
    const res = await fetch(`${API_URL}/${event.id}`, {
      method: 'PATCH',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    return await res.json();
  };

  const deleteEvent = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    return await res.json();
  };

  const getEvent = async (id) => {
    const res = await fetch(`${API_URL}/${id}`, { method: 'GET' });
    return await res.json();
  };

  return { getEvent, getEvents, postEvent, updateEvent, deleteEvent };
})();

class EventModel {
  #events = [];
  constructor() {}

  getEvents() {
    return this.#events;
  }

  getEvent(eventId) {
    return this.#events.find((event) => event.id == eventId);
  }

  async fetchEvents() {
    this.#events = await API.getEvents();
  }

  async addEvent(newEvent) {
    const event = await API.postEvent(newEvent);
    this.#events.push(event);
    return event;
  }

  async editEvent(event) {
    const updatedEvent = await API.updateEvent(event);
    const index = this.#events.findIndex(
      (event) => updatedEvent.id === event.id
    );
    this.#events[index] = updatedEvent;
  }

  async removeEvent(id) {
    try {
      const removedId = await API.deleteEvent(id);
      this.#events = this.#events.filter((event) => event.id !== removedId);
      return removedId;
    } catch (err) {
      console.log(err);
    }
  }
}

class EventView {
  constructor() {
    this.eventlist = document.querySelector('.table');
    this.eventlistAddBtn = document.querySelector('.eventlist_add-btn');
    this.eventId = 0;
  }

  renderEvents(events) {
    this.resetTable();
    events.forEach((event) => {
      this.appendEvent(event);
    });
  }

  removeEvent(id) {
    const element = document.getElementById(`${id}`);
    element.remove();
  }

  removeEventRow(node) {
    node.remove();
  }

  appendEvent(event) {
    const tbodyElem = document.querySelector('.tbody');
    const eventElem = this.createEventElem(event);
    tbodyElem.append(eventElem);
  }

  resetTable() {
    this.eventlist.innerHTML = '';

    const eventColumnHeader = document.createElement('thead');
    eventColumnHeader.innerHTML = `
    <tr>
    <th>Event</th>
    <th>Start</th>
    <th>End</th>
    <th>Actions</th>
    </tr>`;

    const tbody = document.createElement('tbody');
    tbody.classList.add('tbody');

    this.eventlist.append(eventColumnHeader, tbody);
  }

  createImgSvg(action) {
    const altText = action.charAt(0).toUpperCase() + action.slice(1);
    return `<img src='${action}.svg' width="20px" height="20px" alt="${altText}" />`;
  }

  editEvent(event) {
    const eventElem = document.getElementById(event.id);
    eventElem.innerHTML = '';

    const eventNameTd = document.createElement('td');
    const eventStartTd = document.createElement('td');
    const eventEndTd = document.createElement('td');
    const eventActionsTd = document.createElement('td');

    const eventNameInput = document.createElement('input');
    eventNameInput.setAttribute('id', 'name-input');
    eventNameInput.setAttribute('value', event.eventName);

    const eventStartInput = document.createElement('input');
    eventStartInput.setAttribute('id', 'start-date');
    eventStartInput.setAttribute('type', 'date');
    eventStartInput.setAttribute('value', event.startDate);

    const eventEndInput = document.createElement('input');
    eventEndInput.setAttribute('type', 'date');
    eventEndInput.setAttribute('id', 'end-date');
    eventEndInput.setAttribute('value', event.endDate);

    const actionSaveBtn = document.createElement('button');
    actionSaveBtn.classList.add('event_save-btn');
    actionSaveBtn.setAttribute('edit-id', event.id);
    actionSaveBtn.innerHTML = this.createImgSvg('save');

    eventNameTd.append(eventNameInput);
    eventStartTd.append(eventStartInput);
    eventEndTd.append(eventEndInput);

    const actionCancelBtn = document.createElement('button');
    actionCancelBtn.classList.add('event_cancel-btn');
    actionCancelBtn.innerHTML = this.createImgSvg('cancel');
    eventActionsTd.append(actionSaveBtn, actionCancelBtn);
    eventElem.append(eventNameTd, eventStartTd, eventEndTd, eventActionsTd);
  }

  createEventElem(event) {
    this.eventId += 1;
    const eventElem = document.createElement('tr');
    eventElem.classList.add('event');

    const eventNameTd = document.createElement('td');
    const eventStartTd = document.createElement('td');
    const eventEndTd = document.createElement('td');
    const eventActionsTd = document.createElement('td');

    if (event) {
      eventElem.setAttribute('id', event.id);
      eventNameTd.textContent = event.eventName;
      eventStartTd.textContent = event.startDate;
      eventEndTd.textContent = event.endDate;

      const actionEditBtn = document.createElement('button');
      actionEditBtn.classList.add('event_edit-btn');
      actionEditBtn.setAttribute('edit-id', event.id);
      actionEditBtn.innerHTML = this.createImgSvg('edit');

      const actionDeleteBtn = document.createElement('button');
      actionDeleteBtn.classList.add('event_delete-btn');
      actionDeleteBtn.setAttribute('remove-id', event.id);
      actionDeleteBtn.innerHTML = this.createImgSvg('delete');

      eventActionsTd.append(actionEditBtn, actionDeleteBtn);
      eventElem.append(eventNameTd, eventStartTd, eventEndTd, eventActionsTd);
    } else {
      const eventInput = document.createElement('input');
      eventInput.setAttribute('id', 'name-input');

      const eventStartInput = document.createElement('input');
      eventStartInput.setAttribute('id', 'start-date');
      eventStartInput.setAttribute('type', 'date');
      const eventEndInput = document.createElement('input');
      eventEndInput.setAttribute('type', 'date');
      eventEndInput.setAttribute('id', 'end-date');

      const actionAddBtn = document.createElement('button');
      actionAddBtn.classList.add('event_add-btn');
      actionAddBtn.innerHTML = this.createImgSvg('add');

      const actionCancelBtn = document.createElement('button');
      actionCancelBtn.classList.add('event_cancel-btn');
      actionCancelBtn.innerHTML = this.createImgSvg('cancel');

      eventNameTd.append(eventInput);
      eventStartTd.append(eventStartInput);
      eventEndTd.append(eventEndInput);
      eventActionsTd.append(actionAddBtn, actionCancelBtn);
      eventElem.append(eventNameTd, eventStartTd, eventEndTd, eventActionsTd);
    }

    return eventElem;
  }
}

class EventController {
  constructor(model, view) {
    this.model = model;
    this.view = view;
    this.init();
  }

  async init() {
    this.setUpEvents();
    await this.model.fetchEvents();
    this.view.renderEvents(this.model.getEvents());
  }

  setUpEvents() {
    this.setUpAddEventRow();
    this.setUpAddEvent();
    this.setUpEditEvent();
    this.setupEditRowEvent();
    this.setUpDeleteEvent();
    this.setUpCancelBtn();
  }

  setUpCancelBtn() {
    this.view.eventlist.addEventListener('click', (e) => {
      e.preventDefault();
      const isCancelBtn = e.target.classList.contains('event_cancel-btn');
      if (isCancelBtn) {
        this.view.removeEventRow(event.target.parentElement.parentElement);
      }
    });
  }

  setUpAddEventRow() {
    this.view.eventlistAddBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.view.appendEvent();
    });
  }

  setUpAddEvent() {
    this.view.eventlist.addEventListener('click', (e) => {
      const isAddBtn = e.target.classList.contains('event_add-btn');
      if (isAddBtn) {
        const eventName =
          e.target.parentElement.parentElement.children[0].childNodes[0].value;

        const startDate =
          e.target.parentElement.parentElement.children[1].childNodes[0].value;

        const endDate =
          e.target.parentElement.parentElement.children[2].childNodes[0].value;

        this.model
          .addEvent({
            eventName,
            startDate,
            endDate,
          })
          .then((event) => {
            this.view.appendEvent(event);
            this.view.renderEvents(this.model.getEvents());
          });
      }
    });
  }

  setupEditRowEvent() {
    this.view.eventlist.addEventListener('click', (e) => {
      e.preventDefault();
      const isAddBtn = e.target.classList.contains('event_edit-btn');
      if (isAddBtn) {
        this.view.editEvent(
          this.model.getEvent(e.target.getAttribute('edit-id'))
        );
      }
    });
  }

  setUpEditEvent() {
    this.view.eventlist.addEventListener('click', (e) => {
      const isSaveBtn = e.target.classList.contains('event_save-btn');
      if (isSaveBtn) {
        const id = e.target.parentElement.parentElement.id;

        const eventName =
          e.target.parentElement.parentElement.children[0].childNodes[0].value;

        const startDate =
          e.target.parentElement.parentElement.children[1].childNodes[0].value;

        const endDate =
          e.target.parentElement.parentElement.children[2].childNodes[0].value;

        this.model
          .editEvent({
            id,
            eventName,
            startDate,
            endDate,
          })
          .then(() => {
            this.view.renderEvents(this.model.getEvents());
          });
      }
    });
  }

  setUpDeleteEvent() {
    this.view.eventlist.addEventListener('click', (e) => {
      const isDeleteBtn = e.target.classList.contains('event_delete-btn');
      if (isDeleteBtn) {
        const removedId = e.target.getAttribute('remove-id');
        this.model.removeEvent(removedId).then(() => {
          this.view.removeEvent(removedId);
        });
      }
    });
  }
}

const model = new EventModel();
const view = new EventView();
const controller = new EventController(model, view);

// view.renderEvents([
//   {
//     eventName: 'Music Festival',
//     startDate: '2023-01-20',
//     endDate: '2023-01-21',
//     id: 1,
//   },
//   {
//     eventName: 'Food Festival',
//     startDate: '2023-02-01',
//     endDate: '2023-02-02',
//     id: 2,
//   },
// ]);
