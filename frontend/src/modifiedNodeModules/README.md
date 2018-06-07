## Modified Node Modules
### react-panelgroup
`react-panelgroup` tries to fix the dimensions of each panel but checking if its dimensions are correct in relation to other elements. That however broke the resizing. It tries to account for the size of the drawer even though it was not necessary. What I ended up doing is commenting that part of the code out in the module.