import * as JoyCon from 'joy-con-webhid';

const connectButton = document.querySelector('.connect');
const box = document.querySelector('.box') as HTMLDivElement;


if (connectButton) {
  connectButton.addEventListener('click', async () => {
    // `JoyCon.connectJoyCon()` handles the initial HID pairing.
    // It keeps track of connected Joy-Cons in the `JoyCon.connectedJoyCons` Map.
    await JoyCon.connectJoyCon();
  });
}

// Joy-Cons may sleep until touched and fall asleep again if idle, so attach
// the listener dynamically, but only once.

let finalColor = 'rgb(0, 0, 0)';
let boxRotation: number = 0;

setInterval(async () => {
  for (const joyCon of JoyCon.connectedJoyCons.values()) {
    if (joyCon.eventListenerAttached) {
      continue;
    }
    // Open the device and enable standard full mode and inertial measurement
    // unit mode, so the Joy-Con activates the gyroscope and accelerometers.
    await joyCon.open();
    await joyCon.enableRingCon();
    // await joyCon.enableStandardFullMode();
    // await joyCon.enableIMUMode();
    // await joyCon.enableVibration();

    // await joyCon.blinkLED(0);
    /* await joyCon.setLED(0);
    await joyCon.setLED(1);
    await joyCon.setLED(2);
    await joyCon.setLED(3); */

    /* setInterval(async () => {
      // This is just an example of how to blink the LEDs.
      // You can remove this if you don't need it.
      for (let i = 0; i < 16; i++) {
        setTimeout(async () => {
          await joyCon.setLEDState(i);
          //console.log(`LED ${i} set`);
        }, i * 200);
      }
    }, 3200); */
    

    /* await joyCon.setLED(2); */

    // Get information about the connected Joy-Con.
    console.log(await joyCon);
    
    /* joyCon.on('deviceinfo', (info) => {
      console.log(`Device info for ${joyCon.device.productName}:`, info);
    }); */

    joyCon.on('hidinput', ({ detail }) => {
      // Careful, this fires at ~60fps.

      //console.log(`Input report from ${joyCon.device.productName}:`, detail);
      /* if ('ringCon' in detail) {
        //console.log(detail.ringCon.strain);
        const ringConForce = detail.ringCon.strain;
        ringSetBackground(ringConForce);
      } */


      if ('ringCon' in detail && 'strain' in detail.ringCon) {
        //console.log(detail.ringCon.strain);
        let deltaForce = (detail.ringCon.strain - 3396) / 5
        if (deltaForce < 0) finalColor = `rgb(${Math.abs(deltaForce)}, 0, 0)`;
        else if (deltaForce > 0) finalColor = `rgb(0, 0, ${deltaForce})`;

        //console.log(deltaForce, Math.floor(Math.abs(deltaForce) / 16));
        joyCon.setLEDState(Math.floor(Math.abs(deltaForce) / 16));
      }

      if ('home' in detail.buttonStatus && detail.buttonStatus.home === true) {
        finalColor = 'rgb(0, 128, 128)'; // Green when home button is pressed
      }

      
      if ('actualOrientation' in detail && 'beta' in detail.actualOrientation) {
        boxRotation = Number(detail.actualOrientation.beta);
      }

      box.style.transform = `translate(-50%, -50%) rotate(${boxRotation}deg)`;
      document.body.style.backgroundColor = finalColor;

    });


    




    
    joyCon.eventListenerAttached = true;
  }
}, 2000);