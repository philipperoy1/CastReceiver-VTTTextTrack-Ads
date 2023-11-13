const context = cast.framework.CastReceiverContext.getInstance();

const playerManager = context.getPlayerManager();

let isActiveBreak = false;

const mediaData = {
  contentType: "application/dash+xml",
  streamType: "BUFFERED",
  contentUrl:
    "https://storage.googleapis.com/cpe-sample-media/content/big_buck_bunny/big_buck_bunny_m4s_master.mpd",
  adTagUrl:
    "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/vmap_ad_samples&sz=640x480&cust_params=sample_ar%3Dpreonly&ciu_szs=300x250%2C728x90&gdfp_req=1&ad_rule=1&output=vmap&unviewed_position_start=1&env=vp&impl=s&correlator=" +
    Math.floor(Math.random() * 10000),
};

playerManager.setMessageInterceptor(
  cast.framework.messages.MessageType.LOAD,
  (request) => {
    return new Promise((resolve, reject) => {
      // Stream
      request.media.contentUrl = mediaData.contentUrl;
      request.media.contentType = mediaData.contentType;
      request.media.streamType = mediaData.streamType;

      // ADS
      let vastTemplate = new cast.framework.messages.VastAdsRequest();
      vastTemplate.adTagUrl = mediaData.adTagUrl;
      request.media.vmapAdsRequest = vastTemplate;

      // METADATA
      let metadata = new cast.framework.messages.GenericMediaMetadata();
      metadata.title = "Title";
      metadata.subtitle = "Author";
      request.media.metadata = metadata;

      console.log("request = ", request);
      resolve(request);
    });
  }
);

playerManager.addEventListener(
  cast.framework.events.EventType.PLAYER_LOAD_COMPLETE,
  (event) => {
    console.log("PLAYER_LOAD_COMPLETE");
  }
);

playerManager.addEventListener(
  cast.framework.events.EventType.BREAK_STARTED,
  (event) => {
    console.log("BREAK_STARTED", event);
    isActiveBreak = true;
  }
);

playerManager.addEventListener(
  cast.framework.events.EventType.BREAK_ENDED,
  (event) => {
    console.log("BREAK_ENDED", event);
    isActiveBreak = false;
  }
);

playerManager.addEventListener(
  cast.framework.events.EventType.CLIP_STARTED,
  (event) => {
    if (!isActiveBreak) {
      createTextTrack();
    }
  }
);

createTextTrack = () => {
  // Create text tracks object
  const textTracksManager = playerManager.getTextTracksManager();
  // Create track 1 for English text
  const track1 = textTracksManager.createTrack();
  track1.trackContentType = "text/vtt";
  track1.trackContentId = "./textrack.vtt";
  track1.language = "en";
  // Add tracks
  textTracksManager.addTracks([track1]);
  // Set the first matching language text track to be active
  textTracksManager.setActiveByLanguage("en");
};

playerManager.addEventListener(
  cast.framework.events.EventType.REQUEST_EDIT_TRACKS_INFO,
  (event) => {
    console.log("REQUEST_EDIT_TRACKS_INFO", event);
  }
);

playerManager.addEventListener(
  cast.framework.events.EventType.MEDIA_STATUS,
  (event) => {
    console.log(event);
    const mediaInfo = playerManager.getMediaInformation();
    console.log("mediaInfo !!!", mediaInfo);
    const textTracksManager = playerManager.getTextTracksManager();

    console.log("getTracks", textTracksManager.getTracks());
    console.log("getActiveTracks", textTracksManager.getActiveTracks());
  }
);

context.start();
