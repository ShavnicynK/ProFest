from django.contrib import messages
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout


def login_view(request):
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, ("Вы успешно вошли в систему"))
            return redirect('/manage/')
        else:
            messages.success(request, ("Ошибка авторизации. Попробуйте войти позже."))
            return redirect('/login/')

    else:
        return render(request, "sign/login.html", {})


def logout_view(request):
        logout(request)
        messages.success(request, ("Вы успешно вышли из системы"))
        return redirect('/')
