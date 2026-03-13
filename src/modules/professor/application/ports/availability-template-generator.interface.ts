export abstract class IAvailabilityTemplateGenerator {
  abstract generateTemplate(): Promise<Buffer>;
}
