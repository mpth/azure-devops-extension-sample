import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";

import "./WorkItemOpen.scss";

import { Button } from "azure-devops-ui/Button";
import {
  ObservableArray,
  ObservableValue,
} from "azure-devops-ui/Core/Observable";
import { localeIgnoreCaseComparer } from "azure-devops-ui/Core/Util/String";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { ListSelection } from "azure-devops-ui/List";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { Header } from "azure-devops-ui/Header";
import { Page } from "azure-devops-ui/Page";
import { TextField } from "azure-devops-ui/TextField";

import {
  CommonServiceIds,
  getClient,
  IProjectPageService,
} from "azure-devops-extension-api";
import {
  IWorkItemFormNavigationService,
  WorkItemTrackingRestClient,
  WorkItemTrackingServiceIds,
} from "azure-devops-extension-api/WorkItemTracking";

import { showRootComponent } from "../../Common";

class WorkItemOpenContent extends React.Component<{}, {}> {
  private workItemIdValue = new ObservableValue<string | undefined>("1");
  private workItemTypeValue = new ObservableValue<string | undefined>("Bug");
  private selection = new ListSelection();
  private workItemTypes = new ObservableArray<IListBoxItem<string>>();

  constructor(props: {}) {
    super(props);
  }

  public componentDidMount() {
    SDK.init();
    this.loadWorkItemTypes();
  }

  public render(): JSX.Element {
    return (
      <Page className="sample-hub flex-grow">
        <Header title="Work Item Open Sample" />
        <div className="page-content">
          <div className="sample-form-section flex-row flex-center">
            <TextField
              className="sample-work-item-id-input"
              label="Existing work item id"
              value={this.workItemIdValue}
              onChange={(ev, newValue) => {
                this.workItemIdValue.value = newValue;
              }}
            />
            <Button
              className="sample-work-item-button"
              text="Open..."
              onClick={() => this.onOpenExistingWorkItemClick()}
            />
          </div>
          <div className="sample-form-section flex-row flex-center">
            <div className="flex-column">
              <label htmlFor="work-item-type-picker">New work item type:</label>
              <Dropdown<string>
                className="sample-work-item-type-picker"
                items={this.workItemTypes}
                onSelect={(event, item) => {
                  this.workItemTypeValue.value = item.data!;
                }}
                selection={this.selection}
              />
            </div>
            <Button
              className="sample-work-item-button"
              text="New..."
              onClick={() => this.onOpenNewWorkItemClick()}
            />
          </div>
        </div>
      </Page>
    );
  }

  private async loadWorkItemTypes(): Promise<void> {
    const projectService = await SDK.getService<IProjectPageService>(
      CommonServiceIds.ProjectPageService
    );
    const project = await projectService.getProject();

    let workItemTypeNames: string[];

    if (!project) {
      workItemTypeNames = ["Issue"];
    } else {
      const client = getClient(WorkItemTrackingRestClient);
      const types = await client.getWorkItemTypes(project.name);
      workItemTypeNames = types.map((t) => t.name);
      workItemTypeNames.sort((a, b) => localeIgnoreCaseComparer(a, b));
    }

    this.workItemTypes.push(
      ...workItemTypeNames.map((t) => {
        return { id: t, data: t, text: t };
      })
    );
    this.selection.select(0);
  }

  private async onOpenExistingWorkItemClick() {
    if (this.workItemIdValue.value) {
      const navSvc = await SDK.getService<IWorkItemFormNavigationService>(
        WorkItemTrackingServiceIds.WorkItemFormNavigationService
      );
      const result = await navSvc.openWorkItem(
        parseInt(this.workItemIdValue.value)
      );
      // promise returned by openWorkItem should resolve when work item form was closed by clicking the close icon OR pressing the Esc key
      console.log("work item form closed with result", result);
    }
  }

  private async onOpenNewWorkItemClick() {
    const navSvc = await SDK.getService<IWorkItemFormNavigationService>(
      WorkItemTrackingServiceIds.WorkItemFormNavigationService
    );
    if (this.workItemTypeValue.value) {
      const result = await navSvc.openNewWorkItem(
        this.workItemTypeValue.value,
        {
          Title: "Opened a work item from the Work Item Nav Service",
          Tags: "extension;wit-service",
          priority: 1,
          "System.AssignedTo": SDK.getUser().name,
        }
      );
      // promise returned by openWorkItem should resolve when work item form was closed by clicking the close icon OR pressing the Esc key
      console.log("work item form closed with result", result);
    }
  }
}

showRootComponent(<WorkItemOpenContent />);
