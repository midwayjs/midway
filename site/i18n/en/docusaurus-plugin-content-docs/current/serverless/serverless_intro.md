# Introduce

## What Midway Serverless Can Do

Midway Serverless is a Serverless framework for building Node.js cloud functions. help you significantly reduce maintenance costs and focus more on product development in the cloud-native era.

- **Cross-cloud vendor:** One code can be quickly deployed across multiple cloud platforms without worrying that your product will be bound by the cloud vendor.
- **Cloud Integration:** Provides multiple integrated development solutions with community front-end React, Vue, etc.
- **Code Reuse:** Through the dependency injection capability of the framework, each part of the logical unit is naturally reusable and can be quickly and easily combined to generate complex applications.
- **Traditional migration:** Through the runtime scalability of the framework, traditional applications such as Egg.js, Koa, and Express.js can be seamlessly migrated to cloud functions of various cloud vendors

You can use Midway to build your **full stack application**, you can also publish **function services** ,Restful interfaces, etc., you can also add front-end (react,vue) code to **build back-end projects**, or you can use Midway to **migrate traditional** Egg/Koa/Express application elastic containers.

## The relationship between Midway Serverless and Midway

Midway Serverless is a set of development solutions for Serverless cloud platforms produced by Midway. Its content mainly includes the function framework `@midwayjs/faas`, as well as a series of tool chains and launchers matching the platform.

After Midway Serverless 2.0, Midway Serverless and Midway's capabilities are reused, with the same CLI tool chain, compiler, decorator, etc.

At present, Midway Serverless is mainly aimed at FaaS scenarios.

## What the function (FaaS) can do

Many people are not very clear about functions or do not understand what they can do. The current function can be used as a small container. Originally, we wanted to write a complete application to carry the capacity. Now we only need to write the middle logic part and consider the input and output data.

By binding the trigger of the platform, you can carry traffic such as HTTP,Socket, etc.

Through the BaaS SDK provided by the platform, you can call the database, Redis and other services.

Through functions, traditional HTTP API services can be provided, and beautiful pages can be rendered one by one in combination with existing front-end frameworks (react,vue, etc.). It can also be used as an independent data module, waiting to be called (triggered), such as common file upload changes, decompression, etc. It can also be used as a logical part of a timing task and executed at a specified time or interval.

With the change of time, the iteration of the platform, the ability of the function will become stronger, and the user's cost of getting started, the server cost will become lower and lower.

## What can't a function do

The architecture of functions determines that some requirements cannot be supported. In addition, functions and applications are still different in capability.

Function not applicable:

- The execution time exceeds the limit under the function configuration (preferably not more than 5S)
- stateful, storing data locally
- Long links, such as ws, etc.
- Background tasks, executed by big data
- Relying on multi-process communication
- Large file upload (for example, the gateway limit is more than 2M)
- Custom environment, such as nginx configuration, C ++ library (C ++ addon dynamic link library, etc.), Python version depends on
- A large number of server-side caches
- Fixed ip

## Description of terms

### function

A logical snippet of code is executed by wrapping a common entry file. Functions are single link and stateless. Now many people think that Serverless = FaaS + BaaS, while FaaS is a stateless function. BaaS solves stateful services.

### Function group

The logical grouping name of multiple functions, corresponding to the original application concept.

### Trigger

Triggers, also called Event, Trigger, etc., specifically refer to the way functions are triggered.
Different from traditional development concepts, functions do not need to start a service to listen to data, but bind one (or more) triggers. Data is called to functions through a mechanism similar to event triggering.

### Function runtime

The English name is Runtime, which specifically refers to the environment in which the function is executed. It may be a mirror image or a Node.js code package on each platform. For example, there are kubeless when common communities are running. The code package will realize the capabilities of docking various interfaces of the platform, handling exceptions, forwarding logs, etc.

### Publishing platform

The platform finally carried by the function is now the most common in the community such as Aliyun FC, Tencent Cloud SCF,AWS Lambda, etc.

### Layer

Because the runtime code is relatively simple and needs to ensure stability and cannot be updated frequently, Layer is designed to extend the runtime capability and reduce the amount of local function code (some platforms limit the size of the uploaded compression package).
