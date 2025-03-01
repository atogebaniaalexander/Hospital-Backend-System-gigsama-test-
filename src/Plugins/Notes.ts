import Hapi from "@hapi/hapi";

const notesPlugin: Hapi.Plugin<void> = {
  name: "notes",
  register: async function (server: Hapi.Server) {
    server.route([

    ]);
  }

};

export default notesPlugin;