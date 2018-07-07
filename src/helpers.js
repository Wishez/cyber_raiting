export function timeout(callback, timeout) {
    // stuff for animating goes here
    let pastTime = 0;

    function animate(time) {
        if (!pastTime) {
            pastTime = time;
        }
        const delta = time - pastTime;

        if (delta >= timeout) {
            callback();
            return false;
        }

        requestAnimationFrame(animate);
    }

    animate();
}