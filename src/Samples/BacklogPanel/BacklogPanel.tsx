import "./BacklogPanel.scss";

import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import { showRootComponent } from "../../Common";

interface IPanelContentState {
  message?: string;
}

class PanelContent extends React.Component<{}, IPanelContentState> {
  constructor(props: {}) {
    super(props);
    this.state = { message: "" };
  }

  public componentDidMount() {
    SDK.register("sampleBacklogPanelObject", {
      workItemSelectionChanged: (workItemInfos: any) => {
        console.log("workItemSelectionChanged", workItemInfos);
        this.setState({
          message:
            this.state.message +
            workItemInfos.map((item: any) => item.workItemId).join(",") +
            "\n",
        });
      },
    });

    console.log("BacklogPanel: SDK.init()");
    SDK.init();

    SDK.ready().then(() => {
      console.log("BacklogPanel: SDK.ready()...");
    });
  }

  public render(): JSX.Element {
    const { message } = this.state;

    return (
      <div className="sample-panel flex-column flex-grow">
        <pre><code>{message}</code></pre>
      </div>
    );
  }
}

showRootComponent(<PanelContent />);
