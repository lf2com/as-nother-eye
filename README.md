# As Nother Eye

As-nother-eye is a web app for a device to be camera for another one's camera.

## How to Use

The [entry page](https://lf2com.github.io/as-nother-eye) allows us to choose our devices to be as camera or photoer.

### As Camera

[Camera Page](https://lf2com.github.io/as-nother-eye/#/camera)

For ourselves or [photoer](#as-photoer) to control active camera and shutter. When sharing camera, a link of photoer page would be sent and the photoer would automatically connect to the camera.

> _**We can only take, save, and share photos on camera page.**_

#### Camera ID

The camera ID would be generated randomly and display on the top-left with prefix #. The format of camera ID is `#{ID}`

### As Photoer

[Photoer Page](https://lf2com.github.io/as-nother-eye/#/photoer)

Watch camera or take photo by connecting to [camera](#as-camera).

> _**Must connect to a camera for controlling**_

#### Photoer ID

The rule of creating photoer ID is the same as [camera ID](#camera-id). We can confirm if the photoer ID is the right one when camera receiving a connection request.

### As Developer

#### Dev Server

Run the script to start webpack dev server:

```sh
npm run start

# make local server available on the same network
npm run start:public
```

#### Build

The built would be at `./dist`

```sh
npm run build
```
