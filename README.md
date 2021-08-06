# Chat Application
I'm creating a chat application using NodeJS, Express, MongoDB, and Vue (maybe). This is a project for me to experiment with Socket.io and learn how to integrate OAuth 2.0 in a real-world application. This'll be hosted on Heroku and you'll be able to DM people, create your own room and chat with others. 

This app also implements a new design trend called 'neumorphism' which is a minimal way to design with a soft, extruded plastic look.
Learn more about it [here](https://uxdesign.cc/neumorphism-can-we-make-it-more-accessible-15be5fe2ef28)!


## Try It Out
If you wanna check out a working version of the app, look [here](https://chat-app-nandanv.herokuapp.com)!

## Status
WIP

## To-Do
- [x] Get socket.io rooms working again (solve client-side error)
- [ ] Solve room change / disconnect issue - randomly changes room names so socket emits to a "non-existent" room
- [x] Debug user disconnect event
- [x] Use MongoDB cluster online to store user login data (no chat history stored)
- [ ] Implement functionality:
    - [ ] Edit personal information:
        - [ ] Change Register page 'name' to 'username' (only on front-end)
        - [ ] Save about page info to MongoDB
        - [ ] Add an edit button to change about text / to upload a photo - FileFS MongoDB (or cdn?)
        - [ ] add 'deleteRoom' functionality (after pushing rooms to MongoDB)
    - [ ] Chat with person by username (email ID) - most important (in 'messages' section)
    - [ ] Rooms refresh live
- [ ] Host online:
    - [x] How to switch socket port from localhost
    - [ ] Reorganize files into MVC framework, create separate "package" for socket.io code
