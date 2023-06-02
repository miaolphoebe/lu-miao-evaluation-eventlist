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

API.getEvents().then((data) => {
  console.log(data);
});

class EventModel {
  #events = [];
  constructor() {}

  getEvents() {
    return this.#events;
  }

  getEvent(eventId) {
    console.log(eventId);
    return this.#events.filter((event) => event.id === eventId);
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
    return await API.updateEvent(event);
  }

  async removeEvent(id) {
    try {
      const removedId = await API.deleteEvent(id);
      this.#events = this.#events.filter((event) => event.id);
      return removedId;
    } catch (err) {
      console.log(err);
    }
  }
}

class EventView {
  constructor() {
    this.addBtn = null;
    this.eventlist = document.querySelector('.table tbody');
    this.eventlistAddBtn = document.querySelector('.eventlist_add-btn');
    this.eventId = 0;
  }

  renderEvents(events) {
    this.eventlist.innerHTML = '';
    events.forEach((event) => {
      this.appendEvent(event);
    });
  }

  getAddBtn() {
    return document.querySelector('.event_add-btn');
  }

  removeEvent(id) {
    const element = document.getElementById(`${id}`);
    element.remove();
  }

  appendEvent(event) {
    const eventElem = this.createEventElem(event);
    this.eventlist.append(eventElem);
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

    const actionEditBtn = document.createElement('button');
    actionEditBtn.classList.add('event_edit-btn');
    actionEditBtn.setAttribute('edit-id', this.eventId);
    actionEditBtn.textContent = 'Edit';

    eventNameTd.append(eventNameInput);
    eventStartTd.append(eventStartInput);
    eventEndTd.append(eventEndInput);
    eventActionsTd.append(actionAddBtn, actionDeleteBtn);
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

    const actionAddBtn = document.createElement('button');
    actionAddBtn.classList.add('event_add-btn');
    actionAddBtn.textContent = 'Add';
    const actionDeleteBtn = document.createElement('button');
    actionDeleteBtn.textContent = 'Delete';

    actionDeleteBtn.classList.add('event_delete-btn');

    const actionEditBtn = document.createElement('button');
    actionEditBtn.classList.add('event_edit-btn');

    actionEditBtn.textContent = 'Edit';

    if (event) {
      eventElem.setAttribute('id', event.id);
      eventNameTd.textContent = event.eventName;
      eventStartTd.textContent = event.startDate;
      eventEndTd.textContent = event.endDate;
      eventActionsTd.append(actionEditBtn, actionDeleteBtn);
      actionEditBtn.setAttribute('edit-id', event.id);
      actionDeleteBtn.setAttribute('remove-id', event.id);
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

      actionDeleteBtn.setAttribute('remove-id', this.eventId);
      eventNameTd.append(eventInput);
      eventStartTd.append(eventStartInput);
      eventEndTd.append(eventEndInput);
      eventActionsTd.append(actionAddBtn, actionDeleteBtn);
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
      console.log(this.model.getEvent(e.target.getAttribute('edit-id')));
      this.view.editEvent(
        this.model.getEvent(e.target.getAttribute('edit-id'))
      );
    });
  }

  setUpEditEvent() {
    this.view.eventlist.addEventListener('click', (e) => {
      const isEditBtn = e.target.classList.contains('event_edit-finalize-btn');
      if (isEditBtn) {
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
