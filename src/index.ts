import { type Plugin } from "@elizaos/core";

const exampleAction = {
  name: "EXAMPLE_ACTION",
  description: "An example action — replace with your own.",
  similes: ["DEMO", "SAMPLE"],
  validate: async () => true,
  handler: async (_runtime: any, message: any) => {
    console.log("Custom action triggered with message:", message.content?.text);
  },
  examples: [],
};

export const customPlugin: Plugin = {
  name: "custom-plugin",
  description: "My custom ElizaOS plugin",
  actions: [exampleAction],
  providers: [],
  evaluators: [],
};

export default customPlugin;
