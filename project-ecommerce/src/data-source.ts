import "reflect-metadata"
import { DataSource } from "typeorm"
import 'dotenv/config';

export const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: Number(process.env.MYSQL_PORT),
    username: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    synchronize: true,
    logging: false,
    entities: ["src/entity/*.ts"],
    migrations: [],
    subscribers: [],
})
