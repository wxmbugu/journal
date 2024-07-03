# Journal 

Journal Backend

## Prerequisite
- python
- mysql

## To get started:
```
git clone https://github.com/arnold-cf/moneyTransfer_backend.git
``` 
run server:
```
> python run.py
```

env setup:
```
 - Check the .env.example for reference
```
initialize migration:
```
> flask --app main db init
```
run migrations:
```
> flask --app main db migrate -m "migration message"
```
apply migrations:
```
> flask --app main db upgrade

```
help  migrations:
```
> flask --app main db --help 
```
