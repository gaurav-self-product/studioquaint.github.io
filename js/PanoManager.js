/**
 * PanoManager - Core 360 Logic for Studio Quaint
 * Designed for high performance and cross-browser reliability.
 */
class PanoManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.viewer = null;
        this.scenes = [];
    }

    /**
     * Initializes the Marzipano viewer with the project's config.json.
     * @param {string} projectId 
     * @returns {Promise<boolean>}
     */
    async init(projectId) {
        try {
            const Marzipano = window.Marzipano;
            if (!Marzipano) {
                console.error("Marzipano library not found on window object.");
                return false;
            }

            // Fetch config
            const response = await fetch(`assets/projects/${projectId}/360/config.json?v=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const configText = await response.text();
            const data = JSON.parse(configText.trim());

            const viewerOpts = {
                controls: {
                    mouseViewMode: (data.settings && data.settings.mouseViewMode) || 'drag'
                }
            };

            this.viewer = new Marzipano.Viewer(this.container, viewerOpts);

            this.scenes = data.scenes.map((sceneData) => {
                const urlPrefix = `assets/projects/${projectId}/360/tiles`;
                const source = Marzipano.ImageUrlSource.fromString(
                    urlPrefix + "/" + sceneData.id + "/{z}/{f}/{y}/{x}.jpg",
                    { cubeMapPreviewUrl: urlPrefix + "/" + sceneData.id + "/preview.jpg" }
                );

                const geometry = new Marzipano.CubeGeometry(sceneData.levels);
                const limiter = Marzipano.RectilinearView.limit.traditional(
                    sceneData.faceSize,
                    100 * Math.PI / 180,
                    120 * Math.PI / 180
                );
                const view = new Marzipano.RectilinearView(sceneData.initialViewParameters, limiter);

                // Standard way to create a scene with pinned first level
                const scene = this.viewer.createScene({
                    source: source,
                    geometry: geometry,
                    view: view,
                    pinFirstLevel: true
                });

                return {
                    id: sceneData.id,
                    scene: scene,
                    data: sceneData
                };
            });

            if (this.scenes.length > 0) {
                this.scenes[0].scene.switchTo();
                return true;
            }

            return false;
        } catch (err) {
            console.error("PanoManager Initialization Error:", err);
            return false;
        }
    }

    destroy() {
        if (this.viewer) {
            this.viewer.destroy();
            this.viewer = null;
        }
        this.scenes = [];
    }
}

window.PanoManager = PanoManager;
