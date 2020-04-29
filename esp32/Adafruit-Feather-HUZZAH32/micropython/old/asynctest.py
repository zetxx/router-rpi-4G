import asyncio
# from threading import Timer

# clients = []

# async def handle_echo(reader, writer):
#     clients.append(writer)
#     spread()

# async def main():
#     server = await asyncio.start_server(
#         handle_echo, '0.0.0.0', 9000)

#     addr = server.sockets[0].getsockname()
#     print(f'Serving on {addr}')

#     async with server:
#         await server.serve_forever()

# def log(w):
#     w.write(bytes('123', 'utf-8'))
#     asyncio.ensure_future(w.drain())

# def spread():
#     list(map(lambda w: log(w), clients))

# asyncio.run(main())
async def main1():
    print(1)
    await asyncio.sleep(2)
    print(2)
async def main2():
    print(3)
    await asyncio.sleep(1)
    print(4)

async def main():
    await asyncio.create_task(main1())
    await asyncio.create_task(main2())

asyncio.run(main())
