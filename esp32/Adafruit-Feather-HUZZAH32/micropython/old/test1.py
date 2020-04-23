def a():
    c1 = []
    def b(t):
        nonlocal c1
        if (t == 1):
            c1.append(t)
        elif (t == 2):
            c1 = []
        return c1

    return b

c = a()
print(c(0))
print(c(1))
print(c(1))
print(c(2))
print(c(0))