import pyautogui
import time
import mss
import numpy as np

# Watch pixel under the shoe.
pixel_x = 585
pixel_y = 625

# Define 1x1 capture region
monitor = {"top": pixel_y, "left": pixel_x, "width": 1, "height": 1}

STARTING_GROUND_COLOR = (143, 39, 23)
ON_GROUND_COLOR = (143, 42, 24)  # Replace with actual color if needed
IN_AIR_COLOR = (162,129,84)

def get_pixel_color():
    with mss.mss() as sct:
        img = sct.grab(monitor)
        pixel = np.array(img.pixel(0, 0))  # returns BGRA
        return tuple(map(int, (pixel[0], pixel[1], pixel[2])))  # Convert to RGB

def main():
    print("Starting fast pixel color detection. Ctrl+C to stop. Must initiate the first jump manually.")

    starting_to_land = False

    while True:
        color = get_pixel_color()
        # print(f"Current color: {color}")
        if color == IN_AIR_COLOR:
            starting_to_land = True
        else:
            if starting_to_land:
                pyautogui.press('enter')
                time.sleep(0.005) #Prevents hitting enter too fast
                starting_to_land = False


if __name__ == "__main__":
    main()
