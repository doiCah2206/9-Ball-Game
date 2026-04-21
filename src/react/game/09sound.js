var Sound = new (function () {
    ((this.on = !0),
        (this.master = this.on),
        (this.slave = this.on),
        (this.setMasterMute = (e = !1) => {
            ((this.master = !e), this.updateMute());
        }),
        (this.setMute = (e = !1) => {
            ((this.slave = !e), this.updateMute());
        }),
        (this.updateMute = () => {
            this.on = this.master && this.slave;
        }));
})();
((Sound.Play = function (e, t) {
    (void 0 === t && (t = 1), Sound.on) && new Phaser.Sound(game, e, t).play();
}),
    (Sound.createNewAudioContext = function () {
        ((game.sound.context = new AudioContext()),
            game.sound.masterGain.disconnect(),
            (game.sound.masterGain = game.sound.context.createGain()),
            game.sound.masterGain.connect(game.sound.context.destination));
    }),
    (Sound.checkAudioContext = function () {
        if (typeof game === "undefined" || !game || !game.sound || !game.sound.context) return;
        this.isSuspended() && this.startCheckingSuspended();
        const e = game.sound.context.currentTime;
        setTimeout(() => {
            if (typeof game === "undefined" || !game || !game.sound || !game.sound.context) return;
            const t = game.sound.context.currentTime;
            e === t && this.createNewAudioContext();
        }, 1e3);
    }),
    (Sound.startCheckingSuspended = function () {
        (clearInterval(this.intervalId),
            (this.intervalId = setInterval(() => {
                this.isSuspended()
                    ? game.sound.context.resume()
                    : clearInterval(this.intervalId);
            }, 1e3)));
    }),
    (Sound.isSuspended = function () {
        return (
            typeof game !== "undefined" && game && game.sound && game.sound.usingWebAudio && "suspended" === game.sound.context.state
        );
    }),
    setInterval(function () { if (typeof game !== "undefined" && game && game.sound) Sound.checkAudioContext(); }, 1e3));