declare module "react-plotly.js" {
  import { Component } from "react";

  interface PlotParams {
    data: Plotly.Data[];
    layout?: Partial<Plotly.Layout>;
    config?: Partial<Plotly.Config>;
    style?: React.CSSProperties;
    className?: string;
    useResizeHandler?: boolean;
    onInitialized?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
    onPurge?: (figure: Plotly.Figure, graphDiv: HTMLElement) => void;
    onError?: (error: Error) => void;
  }

  export default class Plot extends Component<PlotParams> { }
}

declare namespace Plotly {
  interface Data {
    type?: string;
    x?: (string | number)[];
    y?: number[];
    name?: string;
    marker?: {
      color?: string;
      colors?: string[];
      size?: number;
    };
    fillcolor?: string;
    line?: {
      color?: string;
      width?: number;
      dash?: string;
    };
    boxpoints?: boolean | string;
    offsetgroup?: string;
    legendgroup?: string;
    showlegend?: boolean;
    // Pie chart properties
    values?: number[];
    labels?: string[];
    hole?: number;
    textinfo?: string;
    textposition?: string;
  }

  interface Font {
    size?: number;
    color?: string;
    family?: string;
  }

  interface Layout {
    title?: string | { text: string; font?: Font };
    showlegend?: boolean;
    legend?: {
      orientation?: "h" | "v";
      x?: number;
      y?: number;
      xanchor?: string;
      yanchor?: string;
      font?: Font;
      bgcolor?: string;
    };
    boxmode?: string;
    boxgap?: number;
    boxgroupgap?: number;
    margin?: { t?: number; b?: number; l?: number; r?: number };
    xaxis?: {
      title?: string;
      tickfont?: Font;
      gridcolor?: string;
    };
    hoverlabel?: {
      bgcolor?: string;
      font?: Font;
      bordercolor?: string;
    };
    yaxis?: {
      title?: string;
      tickformat?: string;
      tickprefix?: string;
      gridcolor?: string;
      zerolinecolor?: string;
      titlefont?: Font;
      tickfont?: Font;
    };
    annotations?: Partial<Annotations>[];
    paper_bgcolor?: string;
    plot_bgcolor?: string;
  }

  interface Annotations {
    x: number | string;
    y: number;
    text: string;
    showarrow: boolean;
    font?: { size?: number; color?: string; family?: string };
    xanchor?: string;
    yanchor?: string;
    xref?: string;
    yref?: string;
  }

  interface Config {
    responsive?: boolean;
    displayModeBar?: boolean;
    displaylogo?: boolean;
  }

  interface Figure {
    data: Data[];
    layout: Partial<Layout>;
  }
}
