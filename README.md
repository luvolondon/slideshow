# slideshow
Create slideshows as journalentries and show them to your players:
- Each slide has it´s own audio, background image and slide content (html)
- Slideshows are build with an in-game editor
- Slide playback is controlled by GM
- GM can save optional "GM notes" with each slide, notes are only shown to GM
- JournalEntry tab has a new button "Create Slideshow Entry"

# Install 
- Install module with Manifest URL: https://raw.githubusercontent.com/luvolondon/slideshow/master/module.json
- Activate module in your game world

# Create Slideshow JournalEntry
- As GM open "JournalEntry" tab and click on new "Create Slideshow Entry" button
- Use editor to create the slides

![Slideshow Editor](https://github.com/luvolondon/slideshow/blob/main/screens/screen1.jpg)

## Editor functions
- Right click on an existing slide to add a new slide
- Click red "x" to delete slides
- Drag a slide to a new position to change ordering
- Drag playlist or journal entries onto the drop-zones of a slide. 

### Elements of a slide
- "Audio": playlist that is started when the slide is revealed
- "Background": Image of a JournalEntry that is shown as a fullscreen background image
- "Content": HTML Text of a JournalEntry that is shown as the slide content (centered)
- "GM Notes": HTML Text of a JournalEntry that is shown in the GM Control Window
Caution: Don´t change the links between the slides.

### Show the slideshow to the players
- Click "Show to players" on editor sheet.
- The slideshow is shown on all player´s screens, the UserInterface on the player´s screens is mostly hidden.
- To stop the slideshow close the GM control window

![GM Control Window](https://github.com/luvolondon/slideshow/blob/main/screens/screen2.jpg)

# Libraries used
- https://www.jointjs.com/ : graph editing
- https://revealjs.com/ : presentation framework

# Data format
The slideshow data is saved as the JSON encoded graph description of jointjs in the "content" field of the JournalEntry. 


Change list:

v0.1.0:
Initial release
