export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Section {
  type: string;
  bbox: BoundingBox;
  selector?: string;
}

export interface Component {
  type: string;
  bbox: BoundingBox;
  selector: string;
  attributes: Record<string, string>;
}

export interface DetectedPage {
  url: string;
  sections: Section[];
  components: Component[];
}
