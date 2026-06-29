import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "poopflow",
  brand: {
    displayName: "물한잔똥한번",
    primaryColor: "#4FC3F7",
    icon: "https://static.toss.im/appsintoss/49411/8ab88c84-9433-444b-ad48-8a42da5243fd.png",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
});
