"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const API_AUTH_STRATEGY = "API";
const statusPlugin = {
    name: "app/status",
    register: async function (server) {
        server.route([
            {
                // default status endpoint
                method: "GET",
                path: "/api/v1/",
                handler: (_, h) => h.response({ up: true }).code(200),
                options: {
                    auth: false,
                },
            },
        ]);
    },
};
exports.default = statusPlugin;
//# sourceMappingURL=status.js.map