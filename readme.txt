York University EECS3431 Assignment 2 Free Animation 
Group Members: KyongRok Kim 215813413, Arian Quader 218070607

Animation title: Cat on Duty
Our cat, Max on his duty to save the garden from invasive weed growth. Cat goes around the house looking for 
invasive weed growing out and taking over. He is a special cat that shoots laser out of his eyes when he is
angry. His lasers leave explosions as a aftershock.

                                   ** IMPLEMENTATION **
1. At least one two-level heierachical object
** Cat modeling has movements including walking(legs made up of 2 joints), tail movement,
body movement while walking, neck and head moving smoothly while walking

2. At least one texture either procedually generated or mapped
** uses 10 different texture map to give more realistic look and feel

3. At least one shader edited or designed from scratch to perform a clearly visible effect
** unimplemented

4. 360 degrees camera fly around using lookAt() and setMV().
** there is a camera work that will zoom into the cat and follow the cat's movement (going around in circles)
implemented using lookat() and setMV() function

5. Connection to real-time. You should make sure that your scene runs in real-time on fast enough
machines. Real-time means that one simulated second corresponds roughly to one real second.
** uses TIME variable to keep our animation in real time

6. You should display the frame rate of your program in the console window or the graphics window
once every 2 seconds.
** shows FPS in conolse window every 2 seconds.

7. Animation
** cat moves around the house
** weed modeling appear on the ground, this is drawn by giving time intervals in between
** then cat will shoot laser from his eyes and the weed modeling is replaced by explosion modeling
(weed modeling gets removed and explosion modeling is drawn on the scene).



SOURCE OF TEXTURES
grass image source: https://opengameart.org/content/grass-1
brick image source: https://opengameart.org/content/brick-texture
wood image source: https://opengameart.org/content/wood-texture-tiles
window image source: https://opengameart.org/content/brown-plastic-window-with-matted-glass
fur image source: https://www.dreamstime.com/photos-images/cat-fur.html
roof image source: https://opengameart.org/content/medieval-wooden-roof-woodenroofkutejnikovcolorpng
red color1 image source: https://opengameart.org/node/8857
red color2 image source: https://opengameart.org/sites/default/files/Velvet_S.jpg
red color3 image source: https://opengameart.org/sites/default/files/Blood%20Stone%20CH16.png
dark marble image source: https://opengameart.org/content/dark-marble-seamless