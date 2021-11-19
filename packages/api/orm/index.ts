import { createConnection } from "typeorm";
import { Portfolio } from "./entity/portfolio";
import { ProvisioningStatus } from "../models/ProvisioningStatus";
import "reflect-metadata";
import { CloudServiceProvider } from "../models/CloudServiceProvider";

createConnection()
  .then(async (connection) => {
    const pd = new Portfolio();
    pd.status = ProvisioningStatus.IN_PROGRESS;
    pd.name = "Cheetah portfolio";
    pd.description = "This is a long description";
    pd.csp = CloudServiceProvider.CSP_A;
    pd.dodComponents = ["army", "navy"];
    pd.portfolioManagers = ["jane.manager@dod.mil", "john.manager@dod.mil"];
    pd.taskOrders = "";
    pd.applications = "";
    pd.operators = "";
    await connection.manager.save(pd);
    console.log("Saved a new portfolio with id: " + pd.id);

    const pfs = await connection.manager.find(Portfolio);
    console.log("Loaded portfolios: ", pfs);
  })
  .catch((error) => console.log(error));
